from typing import List, Dict, Any, Optional

class ADKAgent:
    def __init__(
        self,
        name: str,
        role: str,
        description: str,
        tools: Optional[List[str]] = None,
        dependencies: Optional[List[str]] = None,
        version: str = "1.0.0"
    ):
        self.name = name
        self.role = role
        self.description = description
        self.tools = tools or []
        self.dependencies = dependencies or []
        self.version = version
        self.status = "Optimal" # Optimal, Degraded, Offline

    async def execute(self, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Base execution entry. Subclasses must override this to handle agent business logic.
        """
        raise NotImplementedError("Each ADK agent must implement its execute() method.")

    def health_check(self) -> str:
        """
        Perform diagnostic validation. Returns status.
        """
        return self.status

    def get_metadata(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "role": self.role,
            "description": self.description,
            "version": self.version,
            "tools": self.tools,
            "dependencies": self.dependencies,
            "status": self.status
        }
