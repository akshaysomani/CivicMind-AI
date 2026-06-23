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
