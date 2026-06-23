import asyncio
from typing import Dict, Any
from app.ai.tools.registry import Tool, tool_registry

async def query_database_handler(query_string: str, limit: int = 10) -> Dict[str, Any]:
    await asyncio.sleep(0.1)  # Simulate DB I/O
    return {
        "query": query_string,
        "record_count": 2,
        "results": [
            {"id": 1, "issue": "Pothole on Main St", "status": "Open", "ward": 4},
            {"id": 2, "issue": "Streetlight broken", "status": "Closed", "ward": 7}
        ]
    }

async def send_notification_handler(recipient_id: str, message: str, channel: str = "sms") -> Dict[str, Any]:
    await asyncio.sleep(0.05)
    return {
        "recipient": recipient_id,
        "channel": channel,
        "status": "delivered",
        "timestamp": "2026-06-23T23:35:00Z"
    }

async def fetch_map_coordinates_handler(address: str) -> Dict[str, Any]:
    await asyncio.sleep(0.08)
    return {
        "address": address,
        "latitude": 12.9716,
        "longitude": 77.5946,
        "ward": 4,
        "status": "active"
    }

async def get_weather_forecast_handler(city: str) -> Dict[str, Any]:
    await asyncio.sleep(0.06)
    return {
        "city": city,
        "temperature_c": 28.5,
        "air_quality_index": 55,
        "condition": "Partly Cloudy"
    }

async def run_analytics_aggregation_handler(metric: str, group_by: str = "ward") -> Dict[str, Any]:
    await asyncio.sleep(0.12)
    return {
        "metric": metric,
        "group_by": group_by,
        "aggregated_data": {
            "ward_1": 15,
            "ward_2": 8,
            "ward_3": 23,
            "ward_4": 42
        }
    }

# Register predefined tools
tool_registry.register_tool(Tool(
    name="database",
    description="Executes a lookup on the municipal issue history and status registry.",
    input_schema={
        "type": "object",
        "properties": {
            "query_string": {"type": "string", "description": "The search term or query context"},
            "limit": {"type": "integer", "description": "Maximum number of rows to return"}
        },
        "required": ["query_string"]
    },
    output_schema={
        "type": "object",
        "properties": {
            "query": {"type": "string"},
            "record_count": {"type": "integer"},
            "results": {"type": "array"}
        }
    },
    handler=query_database_handler,
    permissions=["Citizen", "Government", "NGO", "Admin"]
))

tool_registry.register_tool(Tool(
    name="notifications",
    description="Dispatches email, push notifications or sms to citizen or responder devices.",
    input_schema={
        "type": "object",
        "properties": {
            "recipient_id": {"type": "string", "description": "The user identifier or contact number"},
            "message": {"type": "string", "description": "Text message payload"},
            "channel": {"type": "string", "enum": ["sms", "email", "push"]}
        },
        "required": ["recipient_id", "message"]
    },
    output_schema={
        "type": "object",
        "properties": {
            "recipient": {"type": "string"},
            "channel": {"type": "string"},
            "status": {"type": "string"},
            "timestamp": {"type": "string"}
        }
    },
    handler=send_notification_handler,
    permissions=["Government", "NGO", "Admin"]
))

tool_registry.register_tool(Tool(
    name="maps",
    description="Queries maps coordinates, geolocation boundaries, and nearest assistance spots.",
    input_schema={
        "type": "object",
        "properties": {
            "address": {"type": "string", "description": "Street name or landmark"}
        },
        "required": ["address"]
    },
    output_schema={
        "type": "object",
        "properties": {
            "address": {"type": "string"},
            "latitude": {"type": "number"},
            "longitude": {"type": "number"},
            "ward": {"type": "integer"},
            "status": {"type": "string"}
        }
    },
    handler=fetch_map_coordinates_handler,
    permissions=["Citizen", "Government", "NGO", "Admin"]
))

tool_registry.register_tool(Tool(
    name="weather",
    description="Loads real-time weather information and local air quality indexes (AQI).",
    input_schema={
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "Name of the target city"}
        },
        "required": ["city"]
    },
    output_schema={
        "type": "object",
        "properties": {
            "city": {"type": "string"},
            "temperature_c": {"type": "number"},
            "air_quality_index": {"type": "integer"},
            "condition": {"type": "string"}
        }
    },
    handler=get_weather_forecast_handler,
    permissions=["Citizen", "Government", "NGO", "Admin"]
))

tool_registry.register_tool(Tool(
    name="analytics",
    description="Runs database aggregations over issue resolution rates, count of complaints by ward or category.",
    input_schema={
        "type": "object",
        "properties": {
            "metric": {"type": "string", "description": "Metric key, e.g. resolutions_total"},
            "group_by": {"type": "string", "description": "Field to aggregate by, e.g. ward, status"}
        },
        "required": ["metric"]
    },
    output_schema={
        "type": "object",
        "properties": {
            "metric": {"type": "string"},
            "group_by": {"type": "string"},
            "aggregated_data": {"type": "object"}
        }
    },
    handler=run_analytics_aggregation_handler,
    permissions=["Government", "Admin"]
))
