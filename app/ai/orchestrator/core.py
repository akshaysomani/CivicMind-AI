import time
import httpx
from typing import Dict, Any, List, Optional
from app.ai.config.settings import settings
from app.ai.prompts.manager import prompt_manager
from app.ai.guardrails.safety import safety_guardrails
from app.ai.telemetry.tracker import telemetry_tracker
from app.ai.memory.manager import memory_manager
from app.ai.knowledge.layer import knowledge_base
from app.ai.planning.planner import planner
from app.ai.workflows.engine import workflow_engine
from app.ai.workflows.langgraph_adapter import langgraph_adapter
from app.ai.registry.core import agent_registry
from app.ai.tools.registry import tool_registry

class AIOrchestrator:
    async def call_gemini_api(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """
        Executes a direct raw HTTP POST request to the Google Gen AI API (Gemini 2.5 Flash).
        """
        key = settings.GEMINI_API_KEY
        if not key or key == "mock-gemini-key-for-development":
            raise ValueError("No valid Gemini API key configured.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.PRIMARY_MODEL}:generateContent?key={key}"
        
        contents = [{"parts": [{"text": prompt}]}]
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": settings.DEFAULT_TEMPERATURE,
                "maxOutputTokens": settings.MAX_OUTPUT_TOKENS
            }
        }
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            candidates = data.get("candidates", [])
            if candidates:
                return candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
            return ""

    async def chat(self, session_id: str, query: str, user_role: str = "Citizen") -> Dict[str, Any]:
        start_time = time.time()
        
        # 1. Safety guardrail check
        is_safe, reason = safety_guardrails.check_query_safety(query)
        if not is_safe:
            duration = (time.time() - start_time) * 1000
            telemetry_tracker.log_execution(
                query=query,
                category="Safety Violation",
                duration_ms=duration,
                model=settings.PRIMARY_MODEL,
                status="blocked",
                errors=reason
            )
            return {
                "response": f"[BLOCKED] Security exception: {reason}",
                "category": "Blocked",
                "agent": "None",
                "safety": {"safe": False, "reason": reason},
                "session_id": session_id,
                "duration_ms": duration,
                "knowledge_sources": []
            }

        # Scrub PII
        clean_query = safety_guardrails.scrub_pii(query)

        # 2. Get and update session memory
        session = memory_manager.get_session(session_id)
        session.add_message("user", clean_query)

        # 3. Intent Classification
        category = await self._classify_intent(clean_query)

        # 4. Map intent to Agent
        agent_name = self._map_category_to_agent(category)
        agent = agent_registry.get_agent(agent_name)

        # 5. Retrieve matching documents from Knowledge Base (RAG)
        knowledge_matches = knowledge_base.query(clean_query, limit=2)
        context = {
            "session_id": session_id,
            "knowledge": knowledge_matches,
            "history": session.get_messages(),
            "user_role": user_role
        }

        # 6. Execute mapped Agent
        agent_output = ""
        confidence = 0.90
        try:
            # Check if we should call actual Gemini for Citizen Assistant
            if agent_name == "CitizenAssistant" and settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "mock-gemini-key-for-development":
                try:
                    # Construct prompt with RAG knowledge & history context
                    knowledge_str = "\n".join([f"- {doc['title']}: {doc['content']}" for doc in knowledge_matches])
                    history_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in context["history"][-5:]])
                    
                    sys_prompt = prompt_manager.get_prompt("citizen_assistant", query=clean_query)
                    full_prompt = (
                        f"Context History:\n{history_str}\n\n"
                        f"Retrieved Reference Materials:\n{knowledge_str}\n\n"
                        f"Citizen Query: {clean_query}\n"
                    )
                    agent_output = await self.call_gemini_api(full_prompt, system_instruction=sys_prompt)
                    confidence = 0.96
                except Exception:
                    # Fallback to mock agent on failure
                    res = await agent.execute(clean_query, context)
                    agent_output = res.get("output", "")
                    confidence = res.get("confidence", 0.90)
            else:
                if agent:
                    res = await agent.execute(clean_query, context)
                    agent_output = res.get("output", "")
                    confidence = res.get("confidence", 0.90)
                else:
                    agent_output = f"I am unable to route this request to a handler. Category: {category}"
        except Exception as e:
            agent_output = f"Error executing agent: {str(e)}"
            confidence = 0.0

        # Save assistant response to memory
        session.add_message("assistant", agent_output, {"agent": agent_name, "category": category})

        duration = (time.time() - start_time) * 1000

        # Log Telemetry
        status_ok = confidence >= settings.CONFIDENCE_THRESHOLD
        telemetry_tracker.log_execution(
            query=clean_query,
            category=category,
            duration_ms=duration,
            model=settings.PRIMARY_MODEL,
            status="success" if status_ok else "failed",
            tokens_used=len(clean_query.split()) + len(agent_output.split())
        )

        return {
            "response": agent_output,
            "category": category,
            "agent": agent_name,
            "safety": {"safe": True, "reason": "Safe"},
            "session_id": session_id,
            "duration_ms": duration,
            "knowledge_sources": knowledge_matches,
            "confidence": confidence
        }

    async def _classify_intent(self, query: str) -> str:
        # Check if we can make a live Gemini call for intent classification
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "mock-gemini-key-for-development":
            try:
                prompt = prompt_manager.get_prompt("intent_classification", query=query)
                res = await self.call_gemini_api(prompt)
                valid_categories = ["Community Issue", "Emergency", "Government Scheme", "Healthcare", "Environment", "Citizen Query", "Analytics", "General Conversation"]
                for cat in valid_categories:
                    if cat.lower() in res.lower():
                        return cat
            except Exception:
                pass

        # Rule-based fallback classification
        query_lower = query.lower()
        if any(k in query_lower for k in ["emergency", "hazard", "fire", "accident", "flood", "evacuate"]):
            return "Emergency"
        elif any(k in query_lower for k in ["hospital", "clinic", "pharmacy", "health", "vaccine", "doctor", "blood bank", "first aid", "medicine", "medical", "patient", "disease"]):
            return "Healthcare"
        elif any(k in query_lower for k in ["faq", "help", "how to", "status", "complaint", "issue", "officer", "ward", "citizen"]):
            return "Citizen Query"
        elif any(k in query_lower for k in ["scheme", "welfare", "grant", "subsidy", "apply"]):
            return "Government Scheme"
        elif any(k in query_lower for k in ["environment", "air quality", "aqi", "pollution", "parks"]):
            return "Environment"
        elif any(k in query_lower for k in ["analytics", "statistics", "count", "aggregate", "resolution rate"]):
            return "Analytics"
        elif any(k in query_lower for k in ["hi", "hello", "hey", "who are you", "what can you do"]):
            return "General Conversation"
        return "General Conversation"

    def _map_category_to_agent(self, category: str) -> str:
        mapping = {
            "Emergency": "EmergencyAdvisor",
            "Healthcare": "HealthcareAdvisor",
            "Citizen Query": "CitizenAssistant",
            "Government Scheme": "SchemeAdvisor",
            "Environment": "EnvironmentalInspector",
            "Analytics": "AnalyticsInsight",
            "General Conversation": "GeneralConversational"
        }
        return mapping.get(category, "GeneralConversational")

    async def execute_task(self, task_id: str, type: str, target: str, input_args: Dict[str, Any], user_role: str = "Citizen") -> Dict[str, Any]:
        start_time = time.time()
        try:
            if type == "tool":
                tool = tool_registry.get_tool(target)
                if not tool:
                    raise ValueError(f"Tool '{target}' not found.")
                res = await tool.execute(user_role=user_role, **input_args)
                status = "success" if res.get("status") == "success" else "failed"
                output = res.get("result") or res.get("message")
            elif type == "agent":
                agent = agent_registry.get_agent(target)
                if not agent:
                    raise ValueError(f"Agent '{target}' not found.")
                res = await agent.execute(query=input_args.get("query", ""), context=input_args)
                status = "success"
                output = res
            else:
                raise ValueError(f"Unsupported execution type '{type}'")
        except Exception as e:
            status = "failed"
            output = {"error": str(e)}

        duration = (time.time() - start_time) * 1000
        telemetry_tracker.log_execution(
            query=f"Direct execution of {type}:{target}",
            category="Direct Execution",
            duration_ms=duration,
            model="direct-tool-call",
            status=status,
            errors=str(output.get("error")) if status == "failed" and isinstance(output, dict) else None
        )

        return {
            "task_id": task_id,
            "status": status,
            "duration_ms": duration,
            "output": output
        }

    async def execute_workflow(self, query: str, user_role: str = "Citizen", session_id: str = "default_session") -> Dict[str, Any]:
        start_time = time.time()
        
        # Dynamic fallback path if requested or fallback keyword present
        if settings.ENABLE_LANGGRAPH_FALLBACK and "fallback" in query.lower():
            graph = langgraph_adapter.build_default_fallback_graph()
            res = await graph.invoke({"query": query})
            duration = (time.time() - start_time) * 1000
            
            trace = []
            for node_name in res.get("visited_nodes", []):
                trace.append({
                    "task_id": f"fallback_{node_name}",
                    "type": "graph_node",
                    "target": node_name,
                    "status": "completed",
                    "duration_ms": duration / len(res["visited_nodes"]),
                    "output": res.get("output") if node_name in ["execute", "block"] else None
                })
            
            return {
                "query": query,
                "status": "success" if res.get("status") != "blocked" else "failed",
                "plan": [],
                "workflow_results": {
                    "status": "success" if res.get("status") != "blocked" else "failure",
                    "trace": trace,
                    "duration_ms": duration,
                    "completed": [f"fallback_{n}" for n in res.get("visited_nodes", [])],
                    "failed": [],
                    "context": res
                }
            }

        # Standard plan generation
        plan = planner.plan(query)
        plan_dicts = [node.to_dict() for node in plan]

        # Execute pipeline
        results = await workflow_engine.execute_plan(plan, user_role=user_role)
        
        duration = (time.time() - start_time) * 1000
        telemetry_tracker.log_execution(
            query=query,
            category="Workflow",
            duration_ms=duration,
            model="ADK Task Planner",
            status="success" if results["status"] == "success" else "failed"
        )
        
        return {
            "query": query,
            "status": results["status"],
            "plan": plan_dicts,
            "workflow_results": results
        }

orchestrator = AIOrchestrator()
