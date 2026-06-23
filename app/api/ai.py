from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from sqlalchemy import select, update, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.models.user import User
from app.models.ai import AIConversation, AIMessage
from app.ai.config.settings import settings
from app.ai.orchestrator.core import orchestrator
from app.ai.registry.core import agent_registry
from app.ai.tools.registry import tool_registry
from app.ai.telemetry.tracker import telemetry_tracker
from app.ai.memory.manager import memory_manager

router = APIRouter(prefix="/ai", tags=["AI Citizen Assistant"])

# Request/Response Schemas
class ChatRequest(BaseModel):
    query: str
    session_id: str = "default_session"

class ConversationCreateRequest(BaseModel):
    title: Optional[str] = "New AI Assistant Chat"
    category: Optional[str] = "General Conversation"

class MessageSendRequest(BaseModel):
    conversation_id: int
    text: str

class FeedbackSubmitRequest(BaseModel):
    message_id: int
    feedback: str  # "like", "dislike"

class ToolExecutionRequest(BaseModel):
    name: str
    arguments: Dict[str, Any]

class ExecuteRequest(BaseModel):
    task_id: str
    type: str  # "agent" or "tool"
    target: str
    input_args: Dict[str, Any]

class WorkflowRequest(BaseModel):
    query: str
    session_id: str = "default_session"


# Conversation & Messages Operations
@router.post("/conversation")
async def create_conversation_endpoint(
    req: ConversationCreateRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    try:
        new_conv = AIConversation(
            title=req.title,
            user_id=current_user.id,
            category=req.category,
            is_pinned=False
        )
        db.add(new_conv)
        await db.commit()
        await db.refresh(new_conv)
        return {
            "id": new_conv.id,
            "title": new_conv.title,
            "category": new_conv.category,
            "is_pinned": new_conv.is_pinned,
            "created_at": new_conv.created_at
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create conversation: {str(e)}"
        )

@router.get("/history")
async def get_history_endpoint(
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    try:
        stmt = select(AIConversation).where(AIConversation.user_id == current_user.id).order_by(desc(AIConversation.is_pinned), desc(AIConversation.updated_at))
        result = await db.execute(stmt)
        conversations = result.scalars().all()
        
        history_list = []
        for conv in conversations:
            # Query message count
            msg_stmt = select(AIMessage).where(AIMessage.conversation_id == conv.id)
            msg_res = await db.execute(msg_stmt)
            messages = msg_res.scalars().all()
            
            history_list.append({
                "id": conv.id,
                "title": conv.title,
                "category": conv.category,
                "is_pinned": conv.is_pinned,
                "created_at": conv.created_at,
                "updated_at": conv.updated_at,
                "message_count": len(messages)
            })
        return history_list
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history: {str(e)}"
        )

@router.post("/message")
async def send_message_endpoint(
    req: MessageSendRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    # Verify conversation ownership
    stmt = select(AIConversation).where(AIConversation.id == req.conversation_id, AIConversation.user_id == current_user.id)
    result = await db.execute(stmt)
    conv = result.scalars().first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation thread not found or access denied."
        )

    try:
        # 1. Save user query message to database
        user_msg = AIMessage(
            conversation_id=conv.id,
            sender="user",
            text=req.text
        )
        db.add(user_msg)
        await db.flush()

        # 2. Call Orchestrator chat
        session_id = f"db_session_{conv.id}"
        orchestrator_res = await orchestrator.chat(
            session_id=session_id,
            query=req.text,
            user_role=current_user.role
        )

        # 3. Save agent response message to database
        confidence_val = orchestrator_res.get("confidence", 0.90)
        tokens_val = len(req.text.split()) + len(orchestrator_res.get("response", "").split())
        
        # Convert knowledge sources to dictionary logs
        knowledge_logs = [
            {
                "doc_id": s.get("doc_id"),
                "title": s.get("title"),
                "content": s.get("content"),
                "category": s.get("category"),
                "score": s.get("score")
            }
            for s in orchestrator_res.get("knowledge_sources", [])
        ]

        agent_msg = AIMessage(
            conversation_id=conv.id,
            sender="agent",
            text=orchestrator_res.get("response", ""),
            agent_name=orchestrator_res.get("agent"),
            category=orchestrator_res.get("category"),
            confidence=confidence_val,
            tokens_used=tokens_val,
            is_safety_violation=not orchestrator_res.get("safety", {}).get("safe", True),
            knowledge_sources=knowledge_logs,
            tool_calls=[]  # filled if tools execute during task plans
        )
        db.add(agent_msg)

        # Update conversation categorization and title dynamically if it's the first exchange
        msg_check_stmt = select(AIMessage).where(AIMessage.conversation_id == conv.id)
        msg_check_res = await db.execute(msg_check_stmt)
        total_msgs = len(msg_check_res.scalars().all())

        if total_msgs <= 2:  # only user query + agent answer
            conv.title = req.text[:40] + ("..." if len(req.text) > 40 else "")
            conv.category = orchestrator_res.get("category", "General Conversation")

        conv.updated_at = user_msg.timestamp
        await db.commit()
        
        await db.refresh(agent_msg)
        await db.refresh(user_msg)
        
        return {
            "conversation_id": conv.id,
            "user_message": {
                "id": user_msg.id,
                "sender": user_msg.sender,
                "text": user_msg.text,
                "timestamp": user_msg.timestamp
            },
            "agent_message": {
                "id": agent_msg.id,
                "sender": agent_msg.sender,
                "text": agent_msg.text,
                "timestamp": agent_msg.timestamp,
                "agent_name": agent_msg.agent_name,
                "category": agent_msg.category,
                "confidence": agent_msg.confidence,
                "tokens_used": agent_msg.tokens_used,
                "is_safety_violation": agent_msg.is_safety_violation,
                "knowledge_sources": agent_msg.knowledge_sources,
                "feedback": agent_msg.feedback
            }
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Message transmission failed: {str(e)}"
        )

@router.get("/conversation/{id}")
async def get_conversation_details_endpoint(
    id: int,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    stmt = select(AIConversation).where(AIConversation.id == id, AIConversation.user_id == current_user.id)
    result = await db.execute(stmt)
    conv = result.scalars().first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation thread not found or access denied."
        )

    msg_stmt = select(AIMessage).where(AIMessage.conversation_id == conv.id).order_by(AIMessage.id)
    msg_res = await db.execute(msg_stmt)
    messages = msg_res.scalars().all()

    return {
        "id": conv.id,
        "title": conv.title,
        "category": conv.category,
        "is_pinned": conv.is_pinned,
        "created_at": conv.created_at,
        "messages": [
            {
                "id": m.id,
                "sender": m.sender,
                "text": m.text,
                "timestamp": m.timestamp,
                "agent_name": m.agent_name,
                "category": m.category,
                "confidence": m.confidence,
                "tokens_used": m.tokens_used,
                "is_safety_violation": m.is_safety_violation,
                "knowledge_sources": m.knowledge_sources,
                "feedback": m.feedback
            }
            for m in messages
        ]
    }

@router.post("/conversation/{id}/pin")
async def toggle_pin_conversation_endpoint(
    id: int,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    stmt = select(AIConversation).where(AIConversation.id == id, AIConversation.user_id == current_user.id)
    result = await db.execute(stmt)
    conv = result.scalars().first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation thread not found."
        )
    
    conv.is_pinned = not conv.is_pinned
    await db.commit()
    return {"id": conv.id, "is_pinned": conv.is_pinned}

@router.delete("/conversation/{id}")
async def delete_conversation_endpoint(
    id: int,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    stmt = select(AIConversation).where(AIConversation.id == id, AIConversation.user_id == current_user.id)
    result = await db.execute(stmt)
    conv = result.scalars().first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation thread not found."
        )

    await db.delete(conv)
    await db.commit()
    return {"status": "deleted", "id": id}

@router.post("/feedback")
async def submit_feedback_endpoint(
    req: FeedbackSubmitRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    # Verify the message's conversation belongs to current user
    msg_stmt = select(AIMessage).where(AIMessage.id == req.message_id)
    msg_res = await db.execute(msg_stmt)
    message = msg_res.scalars().first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target message not found."
        )

    conv_stmt = select(AIConversation).where(AIConversation.id == message.conversation_id, AIConversation.user_id == current_user.id)
    conv_res = await db.execute(conv_stmt)
    conv = conv_res.scalars().first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permission to edit message feedback."
        )

    if req.feedback not in ["like", "dislike"]:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid feedback rating tag value."
        )

    message.feedback = req.feedback
    await db.commit()
    return {"message_id": message.id, "feedback": message.feedback}


@router.get("/suggestions")
async def get_suggestions_endpoint(
    current_user: User = Depends(deps.get_current_user)
):
    # Intelligent prompt suggestions based on user context
    return [
        "I want to report a pothole.",
        "Track my complaint.",
        "What government schemes are available?",
        "What should I do during flooding?",
        "How do I contact my ward officer?",
        "Show nearby hospitals."
    ]

@router.get("/session")
async def get_session_endpoint(
    session_id: str,
    current_user: User = Depends(deps.get_current_user)
):
    # Get active runtime working context variables
    session = memory_manager.get_session(session_id)
    return {
        "session_id": session_id,
        "messages": session.get_messages(),
        "context": session.get_context()
    }


# Backward Compatibility / Direct Tools Executors
@router.post("/chat")
async def chat_endpoint(
    req: ChatRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    # Legacy routing adapter: maps session_id to database thread or executes stateless chat
    try:
        # Try to find conversation by title prefix matching session_id or load default
        stmt = select(AIConversation).where(AIConversation.user_id == current_user.id).order_by(desc(AIConversation.updated_at))
        res = await db.execute(stmt)
        conv = res.scalars().first()

        if not conv:
            # Create a default fallback conversation
            conv = AIConversation(
                title="AI Assistant Chat",
                user_id=current_user.id,
                category="General Conversation"
            )
            db.add(conv)
            await db.commit()
            await db.refresh(conv)

        # Run message save and chat dispatch
        msg_req = MessageSendRequest(conversation_id=conv.id, text=req.query)
        result = await send_message_endpoint(msg_req, current_user, db)
        
        # Format response matching module 7 legacy ChatResponse
        agent_msg = result["agent_message"]
        return {
            "response": agent_msg["text"],
            "category": agent_msg["category"],
            "agent": agent_msg["agent_name"],
            "safety": {"safe": not agent_msg["is_safety_violation"], "reason": "Safe" if not agent_msg["is_safety_violation"] else "Blocked"},
            "session_id": req.session_id,
            "duration_ms": 100.0,
            "knowledge_sources": agent_msg["knowledge_sources"],
            "confidence": agent_msg["confidence"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat execution failed: {str(e)}"
        )

@router.post("/tool")
@router.post("/tools/execute")
async def execute_tool_endpoint(
    req: ToolExecutionRequest,
    current_user: User = Depends(deps.get_current_user)
):
    try:
        tool = tool_registry.get_tool(req.name)
        if not tool:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tool '{req.name}' not found."
            )
        
        result = await tool.execute(user_role=current_user.role, **req.arguments)
        if result.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("message")
            )
        return result
    except PermissionError as pe:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(pe)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Tool execution failed: {str(e)}"
        )

@router.post("/execute")
async def execute_endpoint(
    req: ExecuteRequest,
    current_user: User = Depends(deps.get_current_user)
):
    try:
        result = await orchestrator.execute_task(
            task_id=req.task_id,
            type=req.type,
            target=req.target,
            input_args=req.input_args,
            user_role=current_user.role
        )
        return result
    except PermissionError as pe:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(pe)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Execution failed: {str(e)}"
        )

@router.post("/workflow")
async def workflow_endpoint(
    req: WorkflowRequest,
    current_user: User = Depends(deps.get_current_user)
):
    try:
        result = await orchestrator.execute_workflow(
            query=req.query,
            user_role=current_user.role,
            session_id=req.session_id
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Workflow execution failed: {str(e)}"
        )

@router.get("/agents")
async def get_agents_endpoint(
    current_user: User = Depends(deps.get_current_user)
):
    return agent_registry.list_agents()

@router.get("/tools")
async def get_tools_endpoint(
    current_user: User = Depends(deps.get_current_user)
):
    return tool_registry.list_tools()

@router.get("/status")
async def get_status_endpoint(
    current_user: User = Depends(deps.get_current_user)
):
    return {
        "status": "Healthy",
        "agent_count": len(agent_registry.list_agents()),
        "tool_count": len(tool_registry.list_tools()),
        "active_models": [settings.PRIMARY_MODEL],
        "fallback_langgraph_enabled": settings.ENABLE_LANGGRAPH_FALLBACK
    }

@router.get("/metrics")
async def get_metrics_endpoint(
    current_user: User = Depends(deps.require_role(["Government", "Admin"]))
):
    return telemetry_tracker.get_metrics()
