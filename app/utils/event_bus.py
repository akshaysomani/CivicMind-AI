import asyncio
import logging
from typing import Dict, List, Callable, Any, Awaitable

logger = logging.getLogger("event_bus")

class EventBus:
    def __init__(self):
        self._subscribers: Dict[str, List[Callable[[Dict[str, Any]], Awaitable[None]]]] = {}

    def subscribe(self, event_type: str, callback: Callable[[Dict[str, Any]], Awaitable[None]]):
        """Subscribe to a specific event type with a coroutine callback."""
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(callback)
        logger.info(f"Subscribed callback to event: {event_type}")

    def unsubscribe(self, event_type: str, callback: Callable[[Dict[str, Any]], Awaitable[None]]):
        """Unsubscribe a callback from an event type."""
        if event_type in self._subscribers:
            try:
                self._subscribers[event_type].remove(callback)
                logger.info(f"Unsubscribed callback from event: {event_type}")
            except ValueError:
                pass

    async def publish(self, event_type: str, data: Dict[str, Any]):
        """Publish an event asynchronously to all subscribers."""
        if event_type not in self._subscribers or not self._subscribers[event_type]:
            logger.debug(f"No subscribers for event: {event_type}")
            return

        callbacks = self._subscribers[event_type]
        logger.info(f"Publishing event {event_type} to {len(callbacks)} subscribers")

        # Call all registered callbacks concurrently
        tasks = []
        for cb in callbacks:
            tasks.append(self._safe_execute(cb, event_type, data))
        
        await asyncio.gather(*tasks, return_exceptions=True)

    async def _safe_execute(self, callback: Callable[[Dict[str, Any]], Awaitable[None]], event_type: str, data: Dict[str, Any]):
        try:
            await callback(data)
        except Exception as e:
            logger.error(f"Error executing subscriber callback for event {event_type}: {e}", exc_info=True)

# Global event bus singleton instance
event_bus = EventBus()
