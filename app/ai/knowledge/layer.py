from typing import List, Dict, Any

class Document:
    def __init__(self, doc_id: str, title: str, content: str, category: str):
        self.doc_id = doc_id
        self.title = title
        self.content = content
        self.category = category

class KnowledgeBase:
    def __init__(self):
        self.docs: List[Document] = [
            Document(
                doc_id="faq_1",
                title="Reporting a Pothole",
                content="To report a pothole, citizens can submit an issue report in the Smart Issue Reporting portal. Repairs are managed by the public works department.",
                category="FAQ"
            ),
            Document(
                doc_id="sop_1",
                title="Flood Evacuation Protocol",
                content="In case of active flooding, evacuation route 7 should be prioritized. Local ward collection centers coordinate directly with NGO groups.",
                category="SOP"
            ),
            Document(
                doc_id="rule_1",
                title="Welfare Eligibility Scheme",
                content="Welfare Scheme 104 offers municipal support to senior citizens with an annual income below 300,000 INR. Proof of age and residency is required.",
                category="Rules"
            ),
            Document(
                doc_id="faq_2",
                title="Streetlight Faults",
                content="Municipal electricity department resolves streetlight complaints within 48 business hours. Ensure accurate coordinates are attached.",
                category="FAQ"
            ),
            Document(
                doc_id="sop_fire",
                title="Fire Rescue and Evacuation SOP",
                content="In case of a fire emergency, immediately sound the alarm, evacuate using fire exits (stairs only, do not use lifts), and gather at the external assembly point. Contact fire rescue at 101.",
                category="SOP"
            ),
            Document(
                doc_id="sop_gas_leak",
                title="Municipal Gas Leak Emergency SOP",
                content="For gas leaks, immediately close the primary gas control valve, open all doors and windows, refrain from turning light switches or ignition sources on or off, evacuate the building, and contact the emergency response team at 108.",
                category="SOP"
            ),
            Document(
                doc_id="sop_earthquake",
                title="Seismic Hazard Preparedness Protocol",
                content="During earthquakes, Drop, Cover, and Hold on under heavy furniture. Stay away from glass panels, windows, and heavy bookcases. Once the shaking stops, evacuate to the designated open safe zones.",
                category="SOP"
            ),
            Document(
                doc_id="sop_water_contamination",
                title="Water Quality Contamination Advisory",
                content="If water supply contamination is reported, avoid drinking tap water directly. Boil tap water for a minimum of 15 minutes or filter using municipal emergency guidelines. Clean water tankers will be sent to the affected wards.",
                category="SOP"
            ),
            Document(
                doc_id="health_faq",
                title="General Health and Clinic Discovery",
                content="For general wellness, maintain a balanced diet, engage in 30 minutes of daily exercise, sleep 7-8 hours per night, and drink plenty of water. If you feel unwell, schedule a consultation with a local primary care clinic or family physician.",
                category="Health FAQ"
            ),
            Document(
                doc_id="health_first_aid",
                title="Emergency First Aid Guidance",
                content="For minor cuts, wash with soap and water and apply sterile bandages. For minor burns, cool under running water for 10 minutes. For severe chest pain, shortness of breath, sudden facial drooping or arm weakness, immediately call emergency services (108 or 911) as these may indicate heart attack or stroke.",
                category="First Aid"
            ),
            Document(
                doc_id="health_heatwave",
                title="Heatwave Safety Advisory",
                content="Stay indoors during peak sunlight hours (11 AM to 4 PM). Drink water, buttermilk, or ORS solutions to prevent dehydration. Wear loose, light-colored cotton clothing. Keep windows covered to block radiant heat.",
                category="Advisory"
            ),
            Document(
                doc_id="health_aqi",
                title="Air Pollution Health Guidance",
                content="Monitor local AQI levels. When AQI exceeds 150, limit outdoor activities, especially for children, seniors, and individuals with respiratory issues. Wear N95 masks when going outdoors and run indoor air purifiers.",
                category="Advisory"
            ),
            Document(
                doc_id="health_nhm",
                title="National Health Mission Programs",
                content="The National Health Mission offers free maternal checkups, institutional delivery support (Janani Suraksha Yojana), childhood immunization, and basic diagnostics at government primary health centers.",
                category="Government Scheme"
            ),
            Document(
                doc_id="health_vaccine",
                title="Child Vaccination Schedule",
                content="Children should receive BCG, Hepatitis B, and OPV at birth. DPT and Rotavirus vaccines at 6, 10, and 14 weeks. Measles-Rubella (MR) first dose at 9-12 months. Periodic boosters are required.",
                category="Vaccination"
            ),
            Document(
                doc_id="health_mental",
                title="Mental Wellness Resources",
                content="Citizens can access the national tele-mental health helpline (Kiran Helpline: 1800-599-0019) for free, confidential counseling and support for stress, anxiety, or depression.",
                category="Mental Health"
            ),
            Document(
                doc_id="scheme_pmkisan",
                title="PM-KISAN Income Support for Farmers",
                content="PM-KISAN provides income support of 6,000 INR per year in three equal installments to all landholding farmer families. Eligibility: Must own cultivable land, must not pay income tax, and must not hold public positions.",
                category="Government Scheme"
            ),
            Document(
                doc_id="scheme_startup",
                title="Startup India Seed Fund Scheme",
                content="Startup India Seed Fund offers financial aid up to 20 Lakh INR for prototype validation and 50 Lakh INR for market entry commercialization. Eligibility: DPIIT-registered startup, incorporated under 2 years, utilizing innovative technology.",
                category="Government Scheme"
            ),
            Document(
                doc_id="scheme_janani",
                title="Janani Suraksha Maternity Welfare Yojana",
                content="Janani Suraksha Yojana provides cash assistance (1,400 INR rural, 1,000 INR urban) to pregnant women for institutional deliveries in public health centers to promote maternal wellness.",
                category="Government Scheme"
            ),
            Document(
                doc_id="scheme_skill",
                title="National Skill Development PMKVY Program",
                content="PMKVY offers free skill training courses, industry certifications, and placement assistance to unemployed youth. Eligibility: Indian citizen aged 15-45, student dropout or unemployed status.",
                category="Government Scheme"
            ),
            Document(
                doc_id="scheme_awas",
                title="PM Awas Yojana Affordable Housing",
                content="PM Awas Yojana provides a credit-linked interest subsidy of up to 6.5% on home loans for low-income citizens. Eligibility: Annual household income below 18 Lakh INR, must not own a pucca house.",
                category="Government Scheme"
            ),
            Document(
                doc_id="scheme_pension",
                title="National Pension System Retirement Scheme",
                content="NPS is a voluntary retirement savings scheme providing long-term market investments and pension payouts. Eligibility: Indian citizen aged 18-70, flexible tax deductions up to 1.5 Lakh INR.",
                category="Government Scheme"
            )
        ]

    def query(self, query: str, limit: int = 2) -> List[Dict[str, Any]]:
        # Mock similarity check: simple word overlap
        query_words = set(query.lower().split())
        matched = []
        for doc in self.docs:
            doc_words = set(doc.title.lower().split() + doc.content.lower().split())
            overlap = len(query_words.intersection(doc_words))
            matched.append((doc, overlap))
        
        # Sort by overlap score desc
        matched.sort(key=lambda x: x[1], reverse=True)
        return [
            {
                "doc_id": item[0].doc_id,
                "title": item[0].title,
                "content": item[0].content,
                "category": item[0].category,
                "score": float(item[1])
            }
            for item in matched[:limit]
        ]

knowledge_base = KnowledgeBase()
