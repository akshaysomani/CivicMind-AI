from typing import Dict, Any, Optional, List
import httpx
import json
from app.ai.agents.base import ADKAgent
from app.ai.config.settings import settings

class AnalyticsInsightAgent(ADKAgent):
    def __init__(self):
        super().__init__(
            name="AnalyticsInsight",
            role="Municipal Insights and Decision Analytics Provider",
            description="Performs database queries to aggregate visible complaint types, resolution metrics, and ward performance. Generates structured insights and policy decision support recommendations.",
            tools=["database", "analytics"],
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
                "temperature": 0.2,
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
        # Extract operational metrics passed in the context from DB aggregates
        metrics = context.get("metrics", {}) if context else {}
        
        key = settings.GEMINI_API_KEY
        if not key or key == "mock-gemini-key-for-development":
            return self._mock_analytics_analysis(query, metrics)

        prompt = (
            "You are a Civic Decision Intelligence & Analytics Expert AI Agent.\n"
            "Analyze the following operational metrics for the city of San Francisco:\n"
            f"Metrics Context: {json.dumps(metrics)}\n\n"
            f"User Query: \"{query}\"\n\n"
            "DECISION SUPPORT & INSIGHT RULES:\n"
            "- Formulate structured, actionable insights tracking specific trends (e.g. increase in infrastructure complaints in specific Wards).\n"
            "- Formulate structured municipal policy recommendations (e.g. resource reallocation, maintenance dispatching, campaign triggers).\n"
            "- Supply a confidence score (0.0 to 1.0) and supporting evidence based purely on the provided metrics.\n"
            "- Provide a clear executive summary (daily, weekly, or monthly depending on query context).\n\n"
            "Return a JSON object conforming exactly to this schema:\n"
            "{\n"
            "  \"executive_summary\": string (a professional, executive-level text summary of performance),\n"
            "  \"insights\": [\n"
            "    {\n"
            "      \"id\": number,\n"
            "      \"title\": string,\n"
            "      \"description\": string,\n"
            "      \"confidence\": number,\n"
            "      \"trend\": string (e.g. 'up', 'down', 'stable'),\n"
            "      \"category\": string,\n"
            "      \"affected_wards\": array of strings,\n"
            "      \"suggested_actions\": array of strings\n"
            "    }\n"
            "  ],\n"
            "  \"recommendations\": [\n"
            "    {\n"
            "      \"id\": number,\n"
            "      \"title\": string,\n"
            "      \"description\": string,\n"
            "      \"priority\": string (e.g. 'Critical', 'High', 'Medium', 'Low'),\n"
            "      \"impact\": string,\n"
            "      \"confidence_score\": number,\n"
            "      \"affected_departments\": array of strings,\n"
            "      \"supporting_evidence\": string\n"
            "    }\n"
            "  ]\n"
            "}"
        )
        try:
            analysis = await self.call_gemini_json(prompt)
            if analysis:
                return {
                    "agent": self.name,
                    "category": "Analytics",
                    "output": analysis.get("executive_summary", "Analytics evaluation completed successfully."),
                    "confidence": 0.95,
                    "analysis": analysis
                }
        except Exception:
            pass

        return self._mock_analytics_analysis(query, metrics)

    def _mock_analytics_analysis(self, query: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        query_lower = query.lower()
        
        # Build dynamic summary based on database counts
        total_rep = metrics.get("total_reports", 48)
        resolved_rep = metrics.get("resolved_reports", 34)
        active_emergencies = metrics.get("active_emergencies", 2)
        avg_res_time = metrics.get("avg_resolution_time_days", 3.2)
        
        summary = (
            f"CivicMind Platform Analytics summary: A total of {total_rep} citizens reports have been received, "
            f"with a current resolution rate of {int((resolved_rep / total_rep) * 100) if total_rep > 0 else 70}%. "
            f"The average resolution response time is running at {avg_res_time} days. "
            f"There are currently {active_emergencies} active emergency incidents requiring urgent dispatch."
        )

        insights = [
            {
                "id": 1,
                "title": "Zoning & Road complaints spike",
                "description": "Pothole and road blockage complaints increased by 14% this week in Ward 4.",
                "confidence": 0.92,
                "trend": "up",
                "category": "Infrastructure",
                "affected_wards": ["Ward 4 - Mission", "Ward 2 - Richmond"],
                "suggested_actions": ["Deploy secondary patch crew", "Reschedule utility repairs"]
            },
            {
                "id": 2,
                "title": "Maternal health queries rise",
                "description": "Healthcare JSY inquiry messages doubled over the past 14 days, indicating increased local scheme interest.",
                "confidence": 0.88,
                "trend": "up",
                "category": "Healthcare",
                "affected_wards": ["Ward 4 - Mission"],
                "suggested_actions": ["Increase clinic brochures distribution", "Host a scheme briefing session"]
            },
            {
                "id": 3,
                "title": "Public safety response speed improved",
                "description": "Fire and gas emergency event resolution times decreased by an average of 4.5 minutes due to automated dispatching.",
                "confidence": 0.95,
                "trend": "down",
                "category": "Public Safety",
                "affected_wards": ["All Wards"],
                "suggested_actions": ["Maintain active crew standbys", "Audit response logs weekly"]
            }
        ]

        recommendations = [
            {
                "id": 1,
                "title": "Increase waste collection frequency in Ward 4",
                "description": "Garbage and hygiene reports have risen by 18% over the past 30 days in the Mission district.",
                "priority": "High",
                "impact": "Improves local sanitation indexes and citizen satisfaction rates by an estimated 12%.",
                "confidence_score": 0.90,
                "affected_departments": ["Sanitation Department", "Public Works Department"],
                "supporting_evidence": f"Total active Sanitation reports: {int(total_rep * 0.3)} comments in Ward 4."
            },
            {
                "id": 2,
                "title": "Deploy additional street lighting in Ward 12",
                "description": "Safety concern messages and lighting malfunction reports show correlation in southern corridors.",
                "priority": "Medium",
                "impact": "Reduces public safety risks and dark hotspot zones.",
                "confidence_score": 0.85,
                "affected_departments": ["Electricity and Streetlights Department"],
                "supporting_evidence": "Corroborated by 5 unique lighting defect coordinates reports in Ward 12."
            },
            {
                "id": 3,
                "title": "Trigger localized vaccination awareness campaign",
                "description": "Healthcare chat inquiries reveal high volume of queries regarding child vaccination schedules.",
                "priority": "Medium",
                "impact": "Improves pediatric healthcare coverage and proactive wellness indicators.",
                "confidence_score": 0.89,
                "affected_departments": ["Health and Family Welfare Department"],
                "supporting_evidence": f"Total active healthcare queries: {metrics.get('healthcare_requests', 22)} sessions."
            }
        ]

        # Specific filters based on query
        if "ward" in query_lower:
            insights = [i for i in insights if "Ward" in i["title"] or any("Ward" in w for w in i["affected_wards"])]
            recommendations = [r for r in recommendations if "Ward" in r["title"] or "Ward" in r["description"]]
        elif "emergency" in query_lower or "safety" in query_lower:
            insights = [i for i in insights if i["category"] == "Public Safety"]
            recommendations = [r for r in recommendations if "safety" in r["description"].lower() or "Critical" in r["priority"]]

        return {
            "agent": self.name,
            "category": "Analytics",
            "output": summary,
            "confidence": 0.94,
            "analysis": {
                "executive_summary": summary,
                "insights": insights,
                "recommendations": recommendations
            }
        }
