from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.api import deps
from app.models.user import User
from app.ai.config.settings import settings
from app.ai.orchestrator.core import orchestrator
from app.ai.registry.core import agent_registry
from app.ai.tools.registry import tool_registry
from app.ai.telemetry.tracker import telemetry_tracker

router = APIRouter(prefix="/ai", tags=["AI Orchestration"])

class ChatRequest(BaseModel):
    query: str
    session_id: str = "default_session"

class ExecuteRequest(BaseModel):
    task_id: str
    type: str  # "agent" or "tool"
    target: str
    input_args: Dict[str, Any]

class WorkflowRequest(BaseModel):
    query: str
    session_id: str = "default_session"

class ToolExecuteRequest(BaseModel):
    name: str
    arguments: Dict[str, Any]


@router.post("/chat")
async def chat_endpoint(
    req: ChatRequest,
    current_user: User = Depends(deps.get_current_user)
):
    try:
        result = await orchestrator.chat(
            session_id=req.session_id,
            query=req.query,
            user_role=current_user.role
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat execution failed: {str(e)}"
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

@router.post("/tools/execute")
async def execute_tool_endpoint(
    req: ToolExecuteRequest,
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
