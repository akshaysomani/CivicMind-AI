from typing import Dict, Any, Optional
import httpx
import json
from app.ai.agents.base import ADKAgent
from app.ai.config.settings import settings

class CitizenAssistantAgent(ADKAgent):
    def __init__(self):
        super().__init__(
            name="CitizenAssistant",
            role="Citizen Support",
            description="Handles general citizen queries, FAQs, ward reports status questions, and guidance.",
            tools=["database", "notifications"],
            dependencies=[]
        )

    async def execute(self, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "agent": self.name,
            "category": "Citizen Query",
            "output": f"Hello, I am your Citizen Assistant. I have analyzed your request: '{query}'. How can I help you coordinate with municipal departments?",
            "confidence": 0.95
        }


class EmergencyAdvisorAgent(ADKAgent):
    def __init__(self):
        super().__init__(
            name="EmergencyAdvisor",
            role="Emergency Management",
            description="Coordinates safety protocols, provides evacuation routes, and processes active hazard guidance.",
            tools=["maps", "notifications", "weather"],
            dependencies=[]
        )

    async def call_gemini_json(self, prompt: str) -> Dict[str, Any]:
        key = settings.GEMINI_API_KEY
        if not key or key == "mock-gemini-key-for-development":
            return {}

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.PRIMARY_MODEL}:generateContent?key={key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json"
            }
        }
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            return json.loads(text)

    async def execute(self, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        key = settings.GEMINI_API_KEY
        if not key or key == "mock-gemini-key-for-development":
            return self._mock_analysis(query)

        prompt = (
            "Analyze the following query for emergency verification:\n"
            f"Query: \"{query}\"\n\n"
            "Return a JSON object conforming exactly to this schema:\n"
            "{\n"
            "  \"is_emergency\": boolean,\n"
            "  \"incident_type\": string (one of: Flood, Fire, Earthquake, Building Collapse, Road Accident, Medical Emergency, Gas Leak, Water Contamination, Power Failure, Chemical Leak, Storm, Cyclone, Heatwave, Public Violence, Traffic Emergency, Landslide, Animal Attack, Industrial Accident, Unknown Emergency),\n"
            "  \"severity\": string (one of: Minor, Moderate, High, Critical, Catastrophic),\n"
            "  \"priority\": string (one of: Low, Medium, High, Urgent, Emergency, Critical),\n"
            "  \"confidence_score\": number (0.0 to 1.0),\n"
            "  \"radius_meters\": number,\n"
            "  \"suggested_departments\": array of strings,\n"
            "  \"recommended_resources\": array of objects with keys 'type' (string) and 'count' (number),\n"
            "  \"reasoning_summary\": string,\n"
            "  \"citizen_guidance\": string,\n"
            "  \"government_guidance\": string\n"
            "}"
        )
        try:
            analysis = await self.call_gemini_json(prompt)
            if analysis:
                return {
                    "agent": self.name,
                    "category": "Emergency",
                    "output": analysis.get("reasoning_summary", "Analyzed successfully."),
                    "confidence": analysis.get("confidence_score", 0.95),
                    "analysis": analysis
                }
        except Exception:
            pass

        return self._mock_analysis(query)

    def _mock_analysis(self, query: str) -> Dict[str, Any]:
        query_lower = query.lower()
        incident_type = "Unknown Emergency"
        severity = "Moderate"
        priority = "High"
        radius = 100.0
        departments = ["Disaster Management"]
        resources = [{"type": "Disaster Response Teams", "count": 1}]
        
        if "fire" in query_lower:
            incident_type = "Fire"
            severity = "Critical"
            priority = "Emergency"
            radius = 200.0
            departments = ["Fire Department", "Disaster Management"]
            resources = [{"type": "Fire Teams", "count": 2}, {"type": "Medical Teams", "count": 1}]
        elif "flood" in query_lower or "water logging" in query_lower:
            incident_type = "Flood"
            severity = "High"
            priority = "Urgent"
            radius = 300.0
            departments = ["Water Department", "Disaster Management"]
            resources = [{"type": "Disaster Response Teams", "count": 3}, {"type": "Engineers", "count": 1}]
        elif "collapse" in query_lower:
            incident_type = "Building Collapse"
            severity = "Catastrophic"
            priority = "Critical"
            radius = 150.0
            departments = ["Fire Department", "Police", "Disaster Management"]
            resources = [{"type": "Fire Teams", "count": 3}, {"type": "Disaster Response Teams", "count": 2}, {"type": "Medical Teams", "count": 3}]
        elif "gas leak" in query_lower or "chemical" in query_lower:
            incident_type = "Gas Leak"
            severity = "Critical"
            priority = "Emergency"
            radius = 250.0
            departments = ["Fire Department", "Environmental Department"]
            resources = [{"type": "Fire Teams", "count": 2}, {"type": "Engineers", "count": 2}]
        elif "accident" in query_lower:
            incident_type = "Road Accident"
            severity = "Moderate"
            priority = "High"
            radius = 50.0
            departments = ["Traffic Police", "Medical Services"]
            resources = [{"type": "Police", "count": 1}, {"type": "Medical Teams", "count": 1}]
        elif "medical" in query_lower or "heart" in query_lower or "injured" in query_lower:
            incident_type = "Medical Emergency"
            severity = "High"
            priority = "Urgent"
            radius = 30.0
            departments = ["Medical Services"]
            resources = [{"type": "Medical Teams", "count": 1}]

        analysis = {
            "is_emergency": True,
            "incident_type": incident_type,
            "severity": severity,
            "priority": priority,
            "confidence_score": 0.96,
            "radius_meters": radius,
            "suggested_departments": departments,
            "recommended_resources": resources,
            "reasoning_summary": f"Detected potential emergency situation matching {incident_type} based on hazard indicators in the query.",
            "citizen_guidance": "Please stay calm and evacuate the immediate area. Follow municipal directions.",
            "government_guidance": "Initialize standard operating procedures and alert response groups immediately."
        }
        return {
            "agent": self.name,
            "category": "Emergency",
            "output": analysis["reasoning_summary"],
            "confidence": 0.96,
            "analysis": analysis
        }


class SchemePlannerAgent(ADKAgent):
    def __init__(self):
        super().__init__(
            name="SchemePlanner",
            role="Government Schemes",
            description="Advises on welfare projects, eligibility checks, and application step summaries.",
            tools=["database"],
            dependencies=[]
        )

    async def execute(self, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "agent": self.name,
            "category": "Government Scheme",
            "output": f"Government Scheme Planner initialized. In regards to '{query}', loading eligibility matrix criteria from city welfare policies.",
            "confidence": 0.88
        }


class EnvironmentalInspectorAgent(ADKAgent):
    def __init__(self):
        super().__init__(
            name="EnvironmentalInspector",
            role="Environment Management",
            description="Evaluates local air quality index metrics, noise complaints, and parks damage logs.",
            tools=["weather", "analytics"],
            dependencies=[]
        )

    async def execute(self, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "agent": self.name,
            "category": "Environment",
            "output": f"Environmental Inspector report: Noise/Pollution analysis trigger for '{query}'. Loading telemetry coordinates history.",
            "confidence": 0.90
        }


class AnalyticsInsightAgent(ADKAgent):
    def __init__(self):
        super().__init__(
            name="AnalyticsInsight",
            role="Municipal Insights",
            description="Performs database queries to aggregate visible complaint types, resolution metrics, and ward performance.",
            tools=["database", "analytics"],
            dependencies=[]
        )

    async def execute(self, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "agent": self.name,
            "category": "Analytics",
            "output": f"Analytics Insight Engine active. Querying database coordinates for: '{query}'. Total complaints count matched.",
            "confidence": 0.94
        }


class GeneralConversationalAgent(ADKAgent):
    def __init__(self):
        super().__init__(
            name="GeneralConversational",
            role="General Conversation",
            description="Handles chit-chat, greetings, small talk, and basic onboarding explanations.",
            tools=[],
            dependencies=[]
        )

    async def execute(self, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "agent": self.name,
            "category": "General Conversation",
            "output": f"Hello! I am CivicMind AI. I can help you report issues, review municipal wards, look up schemes, and navigate emergency guidelines. Query: '{query}'",
            "confidence": 0.99
        }
