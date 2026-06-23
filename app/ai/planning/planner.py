from typing import List, Dict, Any, Optional

class TaskNode:
    def __init__(
        self,
        task_id: str,
        type: str,  # "agent" or "tool"
        target: str,  # Name of agent or tool
        input_args: Dict[str, Any],
        dependencies: Optional[List[str]] = None
    ):
        self.task_id = task_id
        self.type = type
        self.target = target
        self.input_args = input_args
        self.dependencies = dependencies or []
        self.status = "pending"  # pending, running, completed, failed
        self.result = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "type": self.type,
            "target": self.target,
            "input_args": self.input_args,
            "dependencies": self.dependencies,
            "status": self.status,
            "result": self.result
        }


class TaskPlanner:
    def plan(self, query: str, context: Optional[Dict[str, Any]] = None) -> List[TaskNode]:
        """
        Decomposes a query into a structured set of execution task nodes.
        Supports simple rule-based decomposition to demonstrate sequential and parallel workflows.
        """
        query_lower = query.lower()
        plan_nodes: List[TaskNode] = []

        # Example 1: Parallel flow - fetching maps coordinates and weather conditions
        if "weather" in query_lower and ("map" in query_lower or "coordinate" in query_lower or "address" in query_lower):
            # Parallel execution of two tools
            city = "Bangalore"
            if "in " in query_lower:
                parts = query_lower.split("in ")
                if len(parts) > 1:
                    city = parts[1].split()[0].strip(",.?!").capitalize()

            address = "MG Road, Bangalore"
            if "at " in query_lower:
                parts = query_lower.split("at ")
                if len(parts) > 1:
                    address = parts[1].split(" and")[0].strip(",.?!")

            plan_nodes.append(TaskNode(
                task_id="task_1",
                type="tool",
                target="weather",
                input_args={"city": city}
            ))
            plan_nodes.append(TaskNode(
                task_id="task_2",
                type="tool",
                target="maps",
                input_args={"address": address}
            ))

        # Example 2: Sequential flow - query database and send notification
        elif "notify" in query_lower and ("db" in query_lower or "database" in query_lower or "query" in query_lower or "search" in query_lower):
            plan_nodes.append(TaskNode(
                task_id="task_1",
                type="tool",
                target="database",
                input_args={"query_string": query, "limit": 5}
            ))
            plan_nodes.append(TaskNode(
                task_id="task_2",
                type="tool",
                target="notifications",
                input_args={
                    "recipient_id": "user_123",
                    "message": "Database query completed successfully.",
                    "channel": "push"
                },
                dependencies=["task_1"]
            ))

        # Example 3: Basic classification and direct agent routing fallback
        else:
            # We determine routing target
            target_agent = "GeneralConversational"
            category = "General Conversation"

            if any(k in query_lower for k in ["emergency", "hazard", "fire", "accident", "flood", "evacuate"]):
                target_agent = "EmergencyAdvisor"
                category = "Emergency"
            elif any(k in query_lower for k in ["faq", "help", "how to", "status", "complaint", "issue", "officer", "ward", "citizen"]):
                target_agent = "CitizenAssistant"
                category = "Citizen Query"
            elif any(k in query_lower for k in ["scheme", "welfare", "grant", "subsidy", "apply"]):
                target_agent = "SchemePlanner"
                category = "Government Scheme"
            elif any(k in query_lower for k in ["environment", "air quality", "aqi", "pollution", "parks"]):
                target_agent = "EnvironmentalInspector"
                category = "Environment"
            elif any(k in query_lower for k in ["analytics", "statistics", "count", "aggregate", "resolution rate"]):
                target_agent = "AnalyticsInsight"
                category = "Analytics"

            plan_nodes.append(TaskNode(
                task_id="task_1",
                type="agent",
                target=target_agent,
                input_args={"query": query}
            ))

        return plan_nodes

planner = TaskPlanner()
