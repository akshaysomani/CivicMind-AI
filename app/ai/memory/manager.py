from typing import Dict, Any, List, Optional

class Message:
    def __init__(self, role: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        self.role = role
        self.content = content
        self.metadata = metadata or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "role": self.role,
            "content": self.content,
            "metadata": self.metadata
        }

class SessionMemory:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.messages: List[Message] = []
        self.context: Dict[str, Any] = {}  # Working memory for variables between tasks

    def add_message(self, role: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        self.messages.append(Message(role, content, metadata))

    def get_messages(self) -> List[Dict[str, Any]]:
        return [msg.to_dict() for msg in self.messages]

    def update_context(self, key: str, value: Any):
        self.context[key] = value

    def get_context(self) -> Dict[str, Any]:
        return self.context

    def clear(self):
        self.messages.clear()
        self.context.clear()

class MemoryManager:
    def __init__(self):
        self._sessions: Dict[str, SessionMemory] = {}

    def get_session(self, session_id: str) -> SessionMemory:
        if session_id not in self._sessions:
            self._sessions[session_id] = SessionMemory(session_id)
        return self._sessions[session_id]

    def delete_session(self, session_id: str):
        if session_id in self._sessions:
            del self._sessions[session_id]

memory_manager = MemoryManager()
