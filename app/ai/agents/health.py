from typing import Dict, Any, Optional
import httpx
import json
from app.ai.agents.base import ADKAgent
from app.ai.config.settings import settings

class HealthcareAdvisorAgent(ADKAgent):
    def __init__(self):
        super().__init__(
            name="HealthcareAdvisor",
            role="Public Health and Medical Support Guidance",
            description="Assists citizens with public health advisories, preventative guidance, vaccination schedules, and first aid tips. Strictly enforces safety guardrails and flags emergency incidents.",
            tools=["database", "maps", "notifications"],
            dependencies=[]
        )
        self.disclaimer = (
            "\n\n*Disclaimer: CivicMind AI provides public health information and first-aid safety guidelines. "
            "It does NOT provide medical diagnoses or prescribe medications. This does not replace professional "
            "medical consultation. If you are experiencing a medical emergency, please call 108 or 911 immediately.*"
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
        # Extract RAG knowledge from context if available
        knowledge_context = ""
        if context and "knowledge" in context:
            matches = context["knowledge"]
            knowledge_context = "\n".join([f"- {doc.get('title')}: {doc.get('content')}" for doc in matches])

        key = settings.GEMINI_API_KEY
        if not key or key == "mock-gemini-key-for-development":
            return self._mock_health_analysis(query, knowledge_context)

        prompt = (
            "You are a Public Health Intelligence AI Agent.\n"
            "Analyze the following citizen query and retrieve appropriate public health and safety recommendations.\n"
            f"Query: \"{query}\"\n\n"
            f"Reference Knowledge context (RAG):\n{knowledge_context}\n\n"
            "CRITICAL MEDICAL SAFETY RULES:\n"
            "1. NEVER provide a medical diagnosis (do not say they have a specific disease).\n"
            "2. NEVER prescribe medications (do not recommend specific dosage or Rx medications).\n"
            "3. If the query indicates an active medical emergency (e.g. chest pain, heart attack symptoms, stroke, choking, severe bleeding, unconsciousness), set is_emergency to true.\n"
            "4. Recommend qualified medical professionals when appropriate.\n\n"
            "Return a JSON object conforming exactly to this schema:\n"
            "{\n"
            "  \"is_emergency\": boolean,\n"
            "  \"emergency_type\": string (e.g. \"Heart Attack\", \"Severe Injury\", \"None\"),\n"
            "  \"severity\": string (one of: Minor, Moderate, High, Critical),\n"
            "  \"intent\": string (one of: Find Hospital, Find Clinic, Find Pharmacy, Health Advice, Vaccination Information, Government Health Scheme, Emergency Medical Help, First Aid Guidance, Public Health Advisory, Nearby Blood Bank, Health FAQ, Unknown Intent),\n"
            "  \"confidence_score\": number (0.0 to 1.0),\n"
            "  \"guidance\": string (the detailed advice adhering to safety protocols),\n"
            "  \"suggested_action\": string (e.g. \"Consult doctor\", \"Call 108\", \"Visit clinic\")\n"
            "}"
        )
        try:
            analysis = await self.call_gemini_json(prompt)
            if analysis:
                guidance_text = analysis.get("guidance", "Guidance parsed successfully.")
                if not guidance_text.endswith(self.disclaimer.strip()):
                    guidance_text += self.disclaimer
                return {
                    "agent": self.name,
                    "category": "Healthcare",
                    "output": guidance_text,
                    "confidence": analysis.get("confidence_score", 0.95),
                    "analysis": analysis
                }
        except Exception:
            pass

        return self._mock_health_analysis(query, knowledge_context)

    def _mock_health_analysis(self, query: str, knowledge: str = "") -> Dict[str, Any]:
        query_lower = query.lower()
        is_emergency = False
        emergency_type = "None"
        severity = "Minor"
        intent = "Health FAQ"
        suggested_action = "Consult healthcare provider"
        confidence = 0.95

        # Check for active emergency symptoms
        emergency_keywords = [
            "chest pain", "breathing difficulty", "shortness of breath", "unconscious",
            "stroke", "heart attack", "choking", "severe bleeding", "heart stops",
            "paralysis", "seizure", "poisoning", "heavy bleeding"
        ]
        if any(k in query_lower for k in emergency_keywords):
            is_emergency = True
            emergency_type = "Medical Emergency"
            severity = "Critical"
            intent = "Emergency Medical Help"
            suggested_action = "Call 108 or 911 immediately"
            guidance = (
                "EMERGENCY WARNING: Your query indicates a potentially life-threatening medical emergency. "
                "Please do not wait or try self-treatment. Immediately contact emergency services at 108 or 911, "
                "or proceed to the nearest emergency department."
            )
        # Check other intents
        elif any(k in query_lower for k in ["hospital", "doctor", "emergency room", "physician"]):
            intent = "Find Hospital"
            severity = "Moderate"
            suggested_action = "Search nearest hospital"
            guidance = "You can search for nearby hospitals and healthcare facilities. Richmond Hospital, UCSF Medical Center, and Mission Medical Clinic are fully operational in your vicinity."
        elif any(k in query_lower for k in ["clinic", "primary care", "health center"]):
            intent = "Find Clinic"
            severity = "Minor"
            suggested_action = "Search nearest clinic"
            guidance = "Primary health clinics offer consultations for general checkups. Mission Health Clinic and Richmond Care Center are available."
        elif any(k in query_lower for k in ["pharmacy", "chemist", "drugstore", "medicine shop"]):
            intent = "Find Pharmacy"
            severity = "Minor"
            suggested_action = "Search nearest pharmacy"
            guidance = "Pharmacies in your area can dispense over-the-counter wellness supplies and prescribed medications. Sunset Pharmacy and Financial District Pharmacy are nearby."
        elif any(k in query_lower for k in ["blood bank", "blood donation", "blood group"]):
            intent = "Nearby Blood Bank"
            severity = "Minor"
            suggested_action = "Check blood bank list"
            guidance = "Municipal Blood Center is operating 24/7. Citizens can verify blood stock availability online or visit for blood donations."
        elif any(k in query_lower for k in ["vaccin", "immuniz", "shots", "calendar"]):
            intent = "Vaccination Information"
            severity = "Minor"
            suggested_action = "View vaccination program details"
            guidance = "The national immunization calendar specifies essential vaccines (BCG, DPT, OPV, Measles) for children. Check the Vaccination Programs tab to see schedules."
        elif any(k in query_lower for k in ["scheme", "government", "nhm", "welfare", "janani"]):
            intent = "Government Health Scheme"
            severity = "Minor"
            suggested_action = "View welfare schemes"
            guidance = "Government health programs such as the National Health Mission and Janani Suraksha Yojana offer free checkups, child immunization, and maternal care support."
        elif any(k in query_lower for k in ["first aid", "burn", "cut", "wound", "cpr"]):
            intent = "First Aid Guidance"
            severity = "Minor"
            suggested_action = "Read first aid guides"
            guidance = "For minor burns, cool under running water. For bleeding cuts, apply pressure with a clean cloth. For a choking victim, administer abdominal thrusts."
        elif any(k in query_lower for k in ["heatwave", "aqi", "pollution", "advisory", "air quality"]):
            intent = "Public Health Advisory"
            severity = "Moderate"
            suggested_action = "Read public health alerts"
            guidance = "In case of a heatwave, stay hydrated and avoid peak sun. During high air pollution, limit strenuous outdoor activities and wear masks."
        else:
            guidance = "I can assist you with local medical facility searches, public health advisories, vaccination schedules, first aid tips, and government wellness programs."

        # Supplement with RAG knowledge if available
        if knowledge and not is_emergency:
            guidance += f"\n\nBased on local resources:\n{knowledge}"

        guidance += self.disclaimer

        return {
            "agent": self.name,
            "category": "Healthcare",
            "output": guidance,
            "confidence": confidence,
            "analysis": {
                "is_emergency": is_emergency,
                "emergency_type": emergency_type,
                "severity": severity,
                "intent": intent,
                "confidence_score": confidence,
                "guidance": guidance,
                "suggested_action": suggested_action
            }
        }
