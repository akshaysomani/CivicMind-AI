import asyncio
from typing import Dict, Any, List, Callable, Tuple, Optional

class StateGraph:
    def __init__(self):
        self.nodes: Dict[str, Callable[[Dict[str, Any]], Any]] = {}
        self.edges: List[Tuple[str, str]] = []
        self.conditional_edges: Dict[str, Tuple[Callable[[Dict[str, Any]], str], Dict[str, str]]] = {}
        self.entry_point: Optional[str] = None

    def add_node(self, name: str, action: Callable[[Dict[str, Any]], Any]):
        self.nodes[name] = action

    def add_edge(self, start: str, end: str):
        self.edges.append((start, end))

    def add_conditional_edges(self, start: str, condition_func: Callable[[Dict[str, Any]], str], path_map: Dict[str, str]):
        self.conditional_edges[start] = (condition_func, path_map)

    def set_entry_point(self, name: str):
        self.entry_point = name

    def compile(self) -> 'CompiledGraph':
        return CompiledGraph(self)


class CompiledGraph:
    def __init__(self, graph: StateGraph):
        self.graph = graph

    async def invoke(self, initial_state: Dict[str, Any]) -> Dict[str, Any]:
        state = initial_state.copy()
        current_node = self.graph.entry_point
        
        if not current_node:
            raise ValueError("Entry point not set for StateGraph.")

        visited = []
        max_steps = 20
        steps = 0

        while current_node and current_node != "END" and steps < max_steps:
            steps += 1
            visited.append(current_node)
            node_action = self.graph.nodes[current_node]
            
            # Execute node (supports both async and sync actions)
            if asyncio.iscoroutinefunction(node_action):
                node_result = await node_action(state)
            else:
                node_result = node_action(state)

            if isinstance(node_result, dict):
                state.update(node_result)

            # Determine next node
            next_node = None
            
            # 1. Check conditional edges
            if current_node in self.graph.conditional_edges:
                cond_func, path_map = self.graph.conditional_edges[current_node]
                cond_res = cond_func(state)
                next_node = path_map.get(cond_res, "END")
            
            # 2. Check standard edges
            else:
                for start, end in self.graph.edges:
                    if start == current_node:
                        next_node = end
                        break

            current_node = next_node

        state["visited_nodes"] = visited
        return state


class LangGraphWorkflowAdapter:
    def __init__(self):
        self.graph = StateGraph()

    def build_default_fallback_graph(self) -> CompiledGraph:
        """
        Creates a default workflow representing dynamic fallback steps:
        Safety Check -> Task Planner -> Task Routing -> Result Processing.
        """
        # Node actions
        async def safety_node(state: Dict[str, Any]) -> Dict[str, Any]:
            # Mock safety validation
            query = state.get("query", "")
            is_malicious = "malicious" in query.lower() or "inject" in query.lower() or "jailbreak" in query.lower() or "ignore" in query.lower()
            return {"safe": not is_malicious}

        def router_condition(state: Dict[str, Any]) -> str:
            if not state.get("safe", True):
                return "unsafe"
            return "safe"

        async def planner_node(state: Dict[str, Any]) -> Dict[str, Any]:
            # Mock planning execution
            query = state.get("query", "")
            return {"plan_status": "planned", "task_count": 1}

        async def execute_node(state: Dict[str, Any]) -> Dict[str, Any]:
            # Mock agent execution fallback
            return {
                "output": f"Fallback LangGraph execution completed for: '{state.get('query')}'",
                "status": "completed"
            }

        async def block_node(state: Dict[str, Any]) -> Dict[str, Any]:
            return {
                "output": "[BLOCKED] Security guidelines violation detected.",
                "status": "blocked"
            }

        self.graph.add_node("safety", safety_node)
        self.graph.add_node("planner", planner_node)
        self.graph.add_node("execute", execute_node)
        self.graph.add_node("block", block_node)

        self.graph.set_entry_point("safety")
        
        # Add conditional routing based on safety check
        self.graph.add_conditional_edges(
            "safety",
            router_condition,
            {"safe": "planner", "unsafe": "block"}
        )
        self.graph.add_edge("planner", "execute")
        self.graph.add_edge("execute", "END")
        self.graph.add_edge("block", "END")

        return self.graph.compile()

langgraph_adapter = LangGraphWorkflowAdapter()
