import time
from typing import Any, Dict, Optional, Union
import logging

logger = logging.getLogger("cache")

class MemoryCache:
    def __init__(self):
        self._data: Dict[str, Dict[str, Any]] = {}
        self.hits = 0
        self.misses = 0

    def get(self, namespace: str, key: str) -> Optional[Any]:
        ns_cache = self._data.get(namespace)
        if ns_cache and key in ns_cache:
            entry = ns_cache[key]
            if entry["expiry"] is None or entry["expiry"] > time.time():
                self.hits += 1
                return entry["value"]
            else:
                # Expired
                del ns_cache[key]
        self.misses += 1
        return None

    def set(self, namespace: str, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        if namespace not in self._data:
            self._data[namespace] = {}
        expiry = time.time() + ttl_seconds if ttl_seconds else None
        self._data[namespace][key] = {
            "value": value,
            "expiry": expiry
        }

    def delete(self, namespace: str, key: str) -> None:
        if namespace in self._data and key in self._data[namespace]:
            del self._data[namespace][key]

    def clear(self, namespace: Optional[str] = None) -> None:
        if namespace:
            if namespace in self._data:
                self._data[namespace] = {}
        else:
            self._data = {}

    def get_stats(self) -> Dict[str, Any]:
        total = self.hits + self.misses
        ratio = (self.hits / total * 100.0) if total > 0 else 0.0
        keys_count = sum(len(ns) for ns in self._data.values())
        return {
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate_percent": float(ratio),
            "keys_count": keys_count,
            "namespaces": list(self._data.keys())
        }

class CacheManager:
    """Enterprise-grade modular Cache Manager with Redis-ready design and in-memory fallback."""
    def __init__(self):
        self.memory = MemoryCache()
        
        # Core enterprise caching domains
        self.SESSION = "session"
        self.QUERY = "query"
        self.ANALYTICS = "analytics"
        self.AI_RESPONSE = "ai_response"
        self.STATIC = "static"
        self.GIS = "gis"
        self.APPLICATION = "application"

    def get(self, namespace: str, key: str) -> Optional[Any]:
        # Connect to Redis here if config has REDIS_URL and redis-py is installed
        return self.memory.get(namespace, key)

    def set(self, namespace: str, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        self.memory.set(namespace, key, value, ttl_seconds)

    def delete(self, namespace: str, key: str) -> None:
        self.memory.delete(namespace, key)

    def clear(self, namespace: Optional[str] = None) -> None:
        self.memory.clear(namespace)

    def get_stats(self) -> Dict[str, Any]:
        return self.memory.get_stats()

cache_manager = CacheManager()
