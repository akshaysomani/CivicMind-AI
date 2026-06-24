from typing import Dict, Any, Optional
import httpx
import json
from app.ai.agents.base import ADKAgent
from app.ai.config.settings import settings

class SchemeAdvisorAgent(ADKAgent):
    def __init__(self):
        super().__init__(
            name="SchemeAdvisor",
            role="Government Schemes Advisor and Eligibility Evaluator",
            description="Assists citizens in discovering, comparing, and explaining eligibility, documents, and application steps for government welfare schemes.",
            tools=["database", "maps", "notifications"],
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
        # Extract RAG knowledge from context if available
        knowledge_context = ""
        if context and "knowledge" in context:
            matches = context["knowledge"]
            knowledge_context = "\n".join([f"- {doc.get('title')}: {doc.get('content')}" for doc in matches])

        key = settings.GEMINI_API_KEY
        if not key or key == "mock-gemini-key-for-development":
            return self._mock_scheme_analysis(query, knowledge_context)

        prompt = (
            "You are a Government Scheme Advisor AI Agent.\n"
            "Analyze the citizen query and evaluate matching government programs, benefits, and eligibility specifications.\n"
            f"Query: \"{query}\"\n\n"
            f"Reference Knowledge context (RAG):\n{knowledge_context}\n\n"
            "ELIGIBILITY REASONING RULES:\n"
            "- Check user demographics if present: age, occupation, student status, income range, gender, location (rural/urban).\n"
            "- Compare against official scheme rules (e.g. PM-KISAN requires cultivable land, PM Awas requires income < 18L and no own house).\n"
            "- Explain required documents and application steps clearly.\n"
            "- Do NOT store user data permanently.\n\n"
            "Return a JSON object conforming exactly to this schema:\n"
            "{\n"
            "  \"intent\": string (one of: Find Scheme, Check Eligibility, Compare Schemes, Application Process, Required Documents, Healthcare Scheme, Education Scheme, Farmer Scheme, Women Scheme, Employment Scheme, Startup Scheme, Housing Scheme, Scholarship, Senior Citizen Scheme, Disability Scheme, Unknown Intent),\n"
            "  \"confidence_score\": number (0.0 to 1.0),\n"
            "  \"reasoning_summary\": string,\n"
            "  \"recommendations\": array of objects with keys 'id' (number), 'title' (string), 'category' (string), 'reason' (string),\n"
            "  \"guidance\": string (the detailed response for the citizen)\n"
            "}"
        )
        try:
            analysis = await self.call_gemini_json(prompt)
            if analysis:
                return {
                    "agent": self.name,
                    "category": "Government Scheme",
                    "output": analysis.get("guidance", "Guidance parsed successfully."),
                    "confidence": analysis.get("confidence_score", 0.90),
                    "analysis": analysis
                }
        except Exception:
            pass

        return self._mock_scheme_analysis(query, knowledge_context)

    def _mock_scheme_analysis(self, query: str, knowledge: str = "") -> Dict[str, Any]:
        query_lower = query.lower()
        intent = "Find Scheme"
        confidence = 0.90
        recommendations = []
        guidance = ""

        # Intent categorization
        if any(k in query_lower for k in ["eligibility", "qualify", "income limit", "age limit"]):
            intent = "Check Eligibility"
        elif any(k in query_lower for k in ["compare", "difference between", "versus", "vs"]):
            intent = "Compare Schemes"
        elif any(k in query_lower for k in ["apply", "how to apply", "steps", "application process"]):
            intent = "Application Process"
        elif any(k in query_lower for k in ["document", "records", "id proof", "certificate"]):
            intent = "Required Documents"
        elif any(k in query_lower for k in ["farmer", "agriculture", "kisan", "crop"]):
            intent = "Farmer Scheme"
        elif any(k in query_lower for k in ["startup", "business", "seed fund", "msme"]):
            intent = "Startup Scheme"
        elif any(k in query_lower for k in ["house", "housing", "awas", "flat", "home loan"]):
            intent = "Housing Scheme"
        elif any(k in query_lower for k in ["pension", "retirement", "senior", "nps"]):
            intent = "Senior Citizen Scheme"
        elif any(k in query_lower for k in ["vaccin", "maternal", "delivery", "janani", "health"]):
            intent = "Healthcare Scheme"
        elif any(k in query_lower for k in ["student", "school", "scholarship", "skill", "training"]):
            intent = "Scholarship"

        # Mock reasoning logic based on user profile clues
        is_farmer = "farmer" in query_lower or "kisan" in query_lower or "land" in query_lower
        is_startup = "startup" in query_lower or "seed" in query_lower or "business" in query_lower
        is_pregnant = "maternal" in query_lower or "delivery" in query_lower or "pregnant" in query_lower
        is_youth = "student" in query_lower or "unemployed" in query_lower or "skill" in query_lower or "pmkvy" in query_lower
        is_poor = "low income" in query_lower or "subsidy" in query_lower or "awas" in query_lower
        is_senior = "senior" in query_lower or "pension" in query_lower or "retirement" in query_lower or "nps" in query_lower

        if is_farmer:
            recommendations.append({
                "id": 1,
                "title": "PM-KISAN Income Support",
                "category": "Farmer Scheme",
                "reason": "Provides 6,000 INR per year to cultivable landholding farmer families."
            })
            guidance = (
                "Based on your profile, you are eligible for the PM-KISAN Scheme. "
                "It provides 6,000 INR annual income support in three equal payments of 2,000 INR directly to the farmer's bank account. "
                "To apply, you need cultivable land registration records, Aadhaar card, and bank account details."
            )
        elif is_startup:
            recommendations.append({
                "id": 2,
                "title": "Startup India Seed Fund Scheme",
                "category": "Startup Scheme",
                "reason": "Offers up to 50 Lakh INR in early-stage grants and scaling investments."
            })
            guidance = (
                "For early stage startups, the Startup India Seed Fund Scheme provides up to 20 Lakh INR for prototype validation "
                "and up to 50 Lakh INR for commercial scaling. Eligibility requires a DPIIT-registered startup incorporated under 2 years."
            )
        elif is_pregnant:
            recommendations.append({
                "id": 3,
                "title": "Janani Suraksha Yojana (JSY)",
                "category": "Healthcare Scheme",
                "reason": "Provides cash incentive (1,000 - 1,400 INR) for institutional delivery at public clinics."
            })
            guidance = (
                "Janani Suraksha Yojana offers cash assistance for safe delivery and maternal care. "
                "Pregnant women delivering at public health clinics receive 1,400 INR in rural areas and 1,000 INR in urban areas."
            )
        elif is_youth:
            recommendations.append({
                "id": 4,
                "title": "National Skill Development Program (PMKVY)",
                "category": "Skill Development",
                "reason": "Provides free industry-aligned skill training and placement support."
            })
            guidance = (
                "Unemployed youth and student dropouts qualify for the Pradhan Mantri Kaushal Vikas Yojana (PMKVY). "
                "It offers free certified vocational courses in retail, IT, electronics, etc., and connects candidates with employers."
            )
        elif is_poor:
            recommendations.append({
                "id": 5,
                "title": "PM Awas Yojana (PMAY-Urban)",
                "category": "Housing Scheme",
                "reason": "Provides credit-linked interest subsidy up to 6.5% for purchasing or constructing affordable houses."
            })
            guidance = (
                "PM Awas Yojana offers credit-linked home loan subsidies for citizens without a pucca house. "
                "Subsidy is available for household incomes up to 18 Lakh INR. Required documents: income certificate, land records, Aadhaar."
            )
        elif is_senior:
            recommendations.append({
                "id": 6,
                "title": "National Pension System (NPS)",
                "category": "Pension Scheme",
                "reason": "Voluntary investment scheme providing retirement pensions and tax exemptions."
            })
            guidance = (
                "The National Pension System (NPS) allows any citizen aged 18-70 to save for retirement. "
                "Contributions are invested in diversified funds. You get tax benefits under Section 80C and a regular monthly pension on maturity."
            )
        else:
            guidance = (
                "I can help you search, compare and verify eligibility for municipal and national welfare schemes. "
                "Try searching for programs in: Education, Healthcare, Startup, Farmers, Pension, or Housing."
            )

        if knowledge and len(recommendations) > 0:
            guidance += f"\n\nReference Guidelines context:\n{knowledge}"

        return {
            "agent": self.name,
            "category": "Government Scheme",
            "output": guidance,
            "confidence": confidence,
            "analysis": {
                "intent": intent,
                "confidence_score": confidence,
                "reasoning_summary": f"Detected intent related to {intent}. Matches recommended programs.",
                "recommendations": recommendations,
                "guidance": guidance
            }
        }
