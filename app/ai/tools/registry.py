from typing import Dict, Any, List, Callable, Optional

class Tool:
    def __init__(
        self,
        name: str,
        description: str,
        input_schema: Dict[str, Any],
        output_schema: Dict[str, Any],
        handler: Callable[..., Any],
        permissions: Optional[List[str]] = None,
        timeout: int = 10,
        retry_policy: Optional[Dict[str, Any]] = None
    ):
        self.name = name
        self.description = description
        self.input_schema = input_schema
        self.output_schema = output_schema
        self.handler = handler
        self.permissions = permissions or ["Citizen", "Government", "NGO", "Admin"]
        self.timeout = timeout
        self.retry_policy = retry_policy or {"retries": 2, "backoff": 1.5}

    async def execute(self, user_role: str, **kwargs) -> Dict[str, Any]:
        # Validate permissions
        if user_role not in self.permissions:
            raise PermissionError(f"Role '{user_role}' is not permitted to execute tool '{self.name}'.")
        
        # In a real environment, we would handle timeout using asyncio.wait_for
        try:
            result = await self.handler(**kwargs)
            return {"status": "success", "result": result}
        except Exception as e:
            return {"status": "error", "message": str(e)}


class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Tool] = {}

    def register_tool(self, tool: Tool):
        self._tools[tool.name] = tool

    def get_tool(self, name: str) -> Optional[Tool]:
        return self._tools.get(name)

    def list_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": t.name,
                "description": t.description,
                "input_schema": t.input_schema,
                "output_schema": t.output_schema,
                "permissions": t.permissions,
                "timeout": t.timeout,
                "retry_policy": t.retry_policy
            }
            for t in self._tools.values()
        ]

tool_registry = ToolRegistry()
