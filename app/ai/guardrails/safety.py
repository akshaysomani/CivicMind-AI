import re
from typing import Dict, Any, Tuple

class GuardrailsSafety:
    def __init__(self, confidence_threshold: float = 0.65):
        self.confidence_threshold = confidence_threshold
        # PII patterns
        self.email_pattern = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
        # Broad phone pattern matching typical international and domestic layouts
        self.phone_pattern = re.compile(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b')
        
        # Common prompt injection signatures
        self.injection_keywords = [
            "ignore previous instructions",
            "system prompt",
            "you are now an unrestricted",
            "bypass system guidelines",
            "jailbreak",
            "ignore guidelines"
        ]

    def scrub_pii(self, text: str) -> str:
        scrubbed = self.email_pattern.sub("[REDACTED_EMAIL]", text)
        scrubbed = self.phone_pattern.sub("[REDACTED_PHONE]", scrubbed)
        return scrubbed

    def check_query_safety(self, query: str) -> Tuple[bool, str]:
        query_lower = query.lower()
        for kw in self.injection_keywords:
            if kw in query_lower:
                return False, f"Potential prompt injection detected (matched: '{kw}')."
        return True, "Safe"

    def check_response_confidence(self, confidence: float) -> bool:
        return confidence >= self.confidence_threshold

safety_guardrails = GuardrailsSafety()
