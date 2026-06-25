import re
from typing import Dict, Any, Tuple, List
import logging

logger = logging.getLogger("ai_security")

# AI Security Log Trail for dashboard auditing
AI_SECURITY_AUDIT_TRAIL: List[Dict[str, Any]] = []

class GuardrailsSafety:
    def __init__(self, confidence_threshold: float = 0.75):
        self.confidence_threshold = confidence_threshold
        # PII patterns (emails, phone numbers, SSNs, credit cards)
        self.email_pattern = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
        self.phone_pattern = re.compile(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b')
        self.ssn_pattern = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
        self.card_pattern = re.compile(r'\b(?:\d{4}[-\s]?){3}\d{4}\b')
        
        # Injection & Jailbreak keywords
        self.injection_keywords = [
            "ignore previous instructions",
            "system prompt",
            "you are now an unrestricted",
            "bypass system guidelines",
            "jailbreak",
            "ignore guidelines",
            "dan mode",
            "unrestricted mode",
            "developer mode enabled",
            "override restrictions"
        ]

    def scrub_pii(self, text: str) -> str:
        scrubbed = self.email_pattern.sub("[REDACTED_EMAIL]", text)
        scrubbed = self.phone_pattern.sub("[REDACTED_PHONE]", scrubbed)
        scrubbed = self.ssn_pattern.sub("[REDACTED_SSN]", scrubbed)
        scrubbed = self.card_pattern.sub("[REDACTED_CARD]", scrubbed)
        return scrubbed

    def check_query_safety(self, query: str) -> Tuple[bool, str]:
        query_lower = query.lower()
        for kw in self.injection_keywords:
            if kw in query_lower:
                self.log_security_alert("Prompt Injection/Jailbreak Attempt", query, f"Matched keyword: '{kw}'")
                return False, f"Potential prompt injection detected (matched: '{kw}')."
        return True, "Safe"

    def check_response_confidence(self, confidence: float) -> bool:
        return confidence >= self.confidence_threshold

    def verify_grounding(self, response: str, sources: List[Dict[str, Any]]) -> Tuple[bool, float, bool]:
        """
        Verify response against RAG sources.
        Returns: (is_grounded, grounding_score, human_review_flag)
        """
        if not sources:
            # If no sources, cannot ground verify, require review
            return True, 1.0, False
            
        # Combine all source content text
        source_text = " ".join([s.get("content", "").lower() for s in sources])
        # Clean words
        source_words = set(re.findall(r'\b\w{4,}\b', source_text))
        response_words = set(re.findall(r'\b\w{4,}\b', response.lower()))
        
        if not response_words:
            return True, 1.0, False
            
        # Compute overlapping words ratio
        overlap = response_words.intersection(source_words)
        score = len(overlap) / len(response_words) if len(response_words) > 0 else 1.0
        
        # Threshold: if grounding score < 0.3, flag for human review
        is_grounded = score >= 0.3
        human_review = not is_grounded
        
        return is_grounded, float(score), human_review

    def validate_output_safety(self, output: str) -> Tuple[bool, str]:
        """Verify output does not contain prohibited content or leaked system flags."""
        if "[system]" in output.lower() or "[assistant]" in output.lower():
            self.log_security_alert("System Prompt Leak Detected", output, "Leaked system formatting markers")
            return False, "Response blocked: Leaked internal system instructions."
        return True, "Safe"

    def log_security_alert(self, event_type: str, raw_data: str, reason: str) -> None:
        import time
        alert = {
            "timestamp": time.time(),
            "event_type": event_type,
            "data_preview": raw_data[:100],
            "reason": reason,
            "severity": "High"
        }
        AI_SECURITY_AUDIT_TRAIL.append(alert)
        logger.error(f"[AI Security Audit Alert] {event_type} | {reason}")

safety_guardrails = GuardrailsSafety()
