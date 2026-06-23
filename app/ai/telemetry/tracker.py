import time
from typing import List, Dict, Any, Optional

class TelemetryRecord:
    def __init__(
        self,
        query: str,
        category: str,
        duration_ms: float,
        model: str,
        status: str,
        tokens_used: int = 0,
        errors: Optional[str] = None
    ):
        self.timestamp = time.time()
        self.query = query
        self.category = category
        self.duration_ms = duration_ms
        self.model = model
        self.status = status  # "success", "failed", "blocked"
        self.tokens_used = tokens_used
        self.errors = errors

    def to_dict(self) -> Dict[str, Any]:
        return {
            "timestamp": self.timestamp,
            "query": self.query,
            "category": self.category,
            "duration_ms": self.duration_ms,
            "model": self.model,
            "status": self.status,
            "tokens_used": self.tokens_used,
            "errors": self.errors
        }


class TelemetryTracker:
    def __init__(self):
        self.records: List[TelemetryRecord] = []

    def log_execution(
        self,
        query: str,
        category: str,
        duration_ms: float,
        model: str,
        status: str,
        tokens_used: int = 0,
        errors: Optional[str] = None
    ):
        record = TelemetryRecord(
            query=query,
            category=category,
            duration_ms=duration_ms,
            model=model,
            status=status,
            tokens_used=tokens_used,
            errors=errors
        )
        self.records.append(record)

    def get_metrics(self) -> Dict[str, Any]:
        if not self.records:
            return {
                "total_queries": 0,
                "success_rate": 100.0,
                "average_latency_ms": 0.0,
                "total_tokens": 0,
                "status_breakdown": {}
            }
        
        success_count = sum(1 for r in self.records if r.status == "success")
        total_latency = sum(r.duration_ms for r in self.records)
        total_tokens = sum(r.tokens_used for r in self.records)
        
        status_breakdown = {}
        for r in self.records:
            status_breakdown[r.status] = status_breakdown.get(r.status, 0) + 1

        return {
            "total_queries": len(self.records),
            "success_rate": float((success_count / len(self.records)) * 100.0),
            "average_latency_ms": float(total_latency / len(self.records)),
            "total_tokens": total_tokens,
            "status_breakdown": status_breakdown
        }

telemetry_tracker = TelemetryTracker()
