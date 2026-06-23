import os

class AISettings:
    # LLM Settings (Gemini 2.5)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "mock-gemini-key-for-development")
    PRIMARY_MODEL: str = "gemini-2.5-flash"
    EMBEDDING_MODEL: str = "text-embedding-004"
    DEFAULT_TEMPERATURE: float = 0.2
    MAX_OUTPUT_TOKENS: int = 2048

    # Safety Guardrails Thresholds
    CONFIDENCE_THRESHOLD: float = 0.65
    SAFETY_BLOCK_THRESHOLD: str = "BLOCK_MEDIUM_AND_ABOVE"

    # Framework Toggle Flags
    ENABLE_LANGGRAPH_FALLBACK: bool = True
    ENABLE_TELEMETRY_LOGGING: bool = True
    PERSISTENT_MEMORY: bool = False # set True for SQL DB persistence
    
    # Mocks for offline testing
    OFFLINE_MOCK_MODE: bool = True

settings = AISettings()
