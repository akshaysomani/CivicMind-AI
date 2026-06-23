import asyncio
import time
from typing import List, Dict, Any, Optional
from app.ai.planning.planner import TaskNode
from app.ai.tools.registry import tool_registry
from app.ai.registry.core import agent_registry

class WorkflowEngine:
    async def execute_plan(
        self,
        plan: List[TaskNode],
        user_role: str = "Citizen",
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes a task execution plan, resolving parallel versus sequential dependencies.
        Returns the overall status and full execution trace.
        """
        start_time = time.time()
        trace: List[Dict[str, Any]] = []
        execution_context = context or {}

        # Create a mapping of task_id to TaskNode for dependency lookups
        nodes_by_id = {node.task_id: node for node in plan}

        # Keep running until all nodes are completed or a critical failure occurs
        completed_tasks = set()
        failed_tasks = set()

        while len(completed_tasks) + len(failed_tasks) < len(plan):
            # Find nodes that are ready to run (all dependencies are in completed_tasks)
            ready_nodes = []
            for node in plan:
                if node.task_id in completed_tasks or node.task_id in failed_tasks or node.status == "running":
                    continue
                
                # Check if all dependencies are completed
                deps_satisfied = True
                for dep_id in node.dependencies:
                    if dep_id not in completed_tasks:
                        deps_satisfied = False
                        break
                
                if deps_satisfied:
                    ready_nodes.append(node)

            if not ready_nodes:
                # If there are pending tasks but none are ready and no tasks are running, we have a deadlock
                if not any(node.status == "running" for node in plan):
                    break
                await asyncio.sleep(0.05)
                continue

            # Execute ready nodes. If multiple, we can run them in parallel (using asyncio.gather)
            tasks_to_run = []
            for node in ready_nodes:
                node.status = "running"
                tasks_to_run.append(self._execute_node(node, user_role, execution_context))

            # Run parallel nodes
            results = await asyncio.gather(*tasks_to_run)

            # Process execution results
            for node, res in zip(ready_nodes, results):
                node.result = res["result"]
                node.status = res["status"]
                
                trace.append({
                    "task_id": node.task_id,
                    "type": node.type,
                    "target": node.target,
                    "status": node.status,
                    "duration_ms": res["duration_ms"],
                    "output": res["result"]
                })

                if node.status == "completed":
                    completed_tasks.add(node.task_id)
                    # Propagate node outputs into the general execution context
                    execution_context[f"{node.task_id}_output"] = node.result
                else:
                    failed_tasks.add(node.task_id)

        duration = (time.time() - start_time) * 1000
        overall_status = "success" if not failed_tasks else "failure"

        return {
            "status": overall_status,
            "trace": trace,
            "duration_ms": duration,
            "completed": list(completed_tasks),
            "failed": list(failed_tasks),
            "context": execution_context
        }

    async def _execute_node(self, node: TaskNode, user_role: str, context: Dict[str, Any]) -> Dict[str, Any]:
        node_start = time.time()
        result = None
        status = "completed"

        # Resolve input arguments that might reference previous task outputs
        resolved_args = {}
        for k, v in node.input_args.items():
            if isinstance(v, str) and v.startswith("$"):
                # Reference link, e.g. "$task_1_output.results"
                ref_key = v[1:]
                if ref_key in context:
                    resolved_args[k] = context[ref_key]
                else:
                    resolved_args[k] = v
            else:
                resolved_args[k] = v

        try:
            if node.type == "tool":
                tool = tool_registry.get_tool(node.target)
                if not tool:
                    raise ValueError(f"Tool '{node.target}' not found in registry.")
                
                # Execute tool
                tool_res = await tool.execute(user_role=user_role, **resolved_args)
                if tool_res.get("status") == "success":
                    result = tool_res.get("result")
                else:
                    raise Exception(tool_res.get("message", "Unknown tool error"))

            elif node.type == "agent":
                agent = agent_registry.get_agent(node.target)
                if not agent:
                    raise ValueError(f"Agent '{node.target}' not found in registry.")
                
                # Execute agent
                agent_res = await agent.execute(query=resolved_args.get("query", ""), context=context)
                result = agent_res
            else:
                raise ValueError(f"Unknown task node type '{node.type}'")
                
        except Exception as e:
            status = "failed"
            result = {"error": str(e)}

        duration_ms = (time.time() - node_start) * 1000
        return {
            "status": status,
            "result": result,
            "duration_ms": duration_ms
        }

workflow_engine = WorkflowEngine()
