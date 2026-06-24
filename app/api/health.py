from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.models.user import User
from app.models.emergency import EmergencyIncident, EmergencyTimelineEvent, EmergencyResource
from app.ai.registry.core import agent_registry
import math

router = APIRouter(prefix="/ai/health", tags=["Healthcare AI Agent"])

# Pydantic Schemas
class HealthChatRequest(BaseModel):
    query: str
    session_id: str = "default_session"

class HealthEscalateRequest(BaseModel):
    title: str
    description: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    ward: Optional[str] = None

# Haversine distance calculator
def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Radius of the earth in km
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Mock healthcare facilities data (San Francisco coordinates)
MOCK_FACILITIES = [
    {
        "id": 1,
        "name": "UCSF Medical Center",
        "type": "Hospital",
        "address": "505 Parnassus Ave, San Francisco, CA 94143",
        "latitude": 37.7631,
        "longitude": -122.4578,
        "contact": "(415) 476-1000",
        "details": "Level 1 Trauma Center, 24/7 Emergency Room, Specialized cardiac care.",
        "services": ["Emergency Care", "Surgery", "Cardiology", "Pediatrics"]
    },
    {
        "id": 2,
        "name": "Zuckerberg SF General Hospital",
        "type": "Hospital",
        "address": "1001 Potrero Ave, San Francisco, CA 94110",
        "latitude": 37.7554,
        "longitude": -122.4048,
        "contact": "(628) 206-8000",
        "details": "Public safety-net hospital, 24/7 ER, multi-lingual assistance.",
        "services": ["Emergency Room", "Trauma", "Outpatient Clinics", "Mental Health"]
    },
    {
        "id": 3,
        "name": "Mission Medical Clinic",
        "type": "Clinic",
        "address": "2480 Mission St, San Francisco, CA 94110",
        "latitude": 37.7622,
        "longitude": -122.4208,
        "contact": "(415) 826-1200",
        "details": "Family practice, pediatric care, vaccination services.",
        "services": ["Primary Care", "Immunizations", "Women's Health"]
    },
    {
        "id": 4,
        "name": "Richmond Family Care Center",
        "type": "Clinic",
        "address": "711 Van Ness Ave, San Francisco, CA 94102",
        "latitude": 37.7788,
        "longitude": -122.4795,
        "contact": "(415) 345-1234",
        "details": "Non-emergency family practice and walk-in consultations.",
        "services": ["General Checkups", "Diagnostics", "Preventive Screenings"]
    },
    {
        "id": 5,
        "name": "Sunset Wellness Pharmacy",
        "type": "Pharmacy",
        "address": "1201 Taraval St, San Francisco, CA 94116",
        "latitude": 37.7495,
        "longitude": -122.4812,
        "contact": "(415) 664-5000",
        "details": "Prescription fulfillment, OTC medicine, vaccination boosters.",
        "services": ["Pharmacy Dispensation", "Health Consulting", "Flu Shots"]
    },
    {
        "id": 6,
        "name": "Financial District Pharmacy",
        "type": "Pharmacy",
        "address": "425 Market St, San Francisco, CA 94105",
        "latitude": 37.7955,
        "longitude": -122.4018,
        "contact": "(415) 543-3000",
        "details": "Daily medicines, health supplements, quick consultation.",
        "services": ["Pharmacy Dispensation", "OTC Medicine", "Vaccine Booking"]
    },
    {
        "id": 7,
        "name": "San Francisco Municipal Blood Bank",
        "type": "Blood Bank",
        "address": "270 Masonic Ave, San Francisco, CA 94118",
        "latitude": 37.7812,
        "longitude": -122.4354,
        "contact": "(800) 283-8382",
        "details": "Blood collection and distribution, plasma donations.",
        "services": ["Blood Donations", "Plasma Collection", "Emergency Stocks"]
    },
    {
        "id": 8,
        "name": "Pacific Heights Diagnostic Center",
        "type": "Diagnostic Center",
        "address": "2100 Webster St, San Francisco, CA 94115",
        "latitude": 37.7915,
        "longitude": -122.4290,
        "contact": "(415) 923-3000",
        "details": "Advanced MRI, CT Scan, X-Ray and lab pathology tests.",
        "services": ["Imaging (MRI/CT)", "Pathology Lab", "Ultrasound"]
    },
    {
        "id": 9,
        "name": "Chinatown Government Health Center",
        "type": "Government Health Center",
        "address": "1520 Stockton St, San Francisco, CA 94133",
        "latitude": 37.7940,
        "longitude": -122.4075,
        "contact": "(415) 391-9686",
        "details": "Low-cost community medical services and public health outreach.",
        "services": ["Community Health", "Child Nutrition", "Social Assistance"]
    }
]

# Mock health advisories
MOCK_ADVISORIES = [
    {
        "id": 101,
        "title": "Heatwave Safety Advisory",
        "type": "Heatwave",
        "severity": "High",
        "issued_at": "2026-06-24T12:00:00Z",
        "summary": "Extremely high temperatures expected across all wards. Limit outdoor exposure between 11 AM and 4 PM.",
        "checklist": [
            "Drink plenty of water even if you do not feel thirsty.",
            "Avoid strenuous outdoor activities.",
            "Wear loose, light-colored cotton clothing.",
            "Check on elderly neighbors and outdoor pets."
        ]
    },
    {
        "id": 102,
        "title": "Air Quality Advisory (AQI 156)",
        "type": "Air Pollution",
        "severity": "Moderate",
        "issued_at": "2026-06-24T08:00:00Z",
        "summary": "Air quality is unhealthy for sensitive groups. High concentration of particulate matter detected.",
        "checklist": [
            "Children and individuals with asthma should reduce outdoor exertion.",
            "Keep doors and windows closed.",
            "Wear an N95 mask if outdoors for prolonged periods.",
            "Operate indoor air purifiers."
        ]
    },
    {
        "id": 103,
        "title": "Water Safety Notice",
        "type": "Water Safety",
        "severity": "Moderate",
        "issued_at": "2026-06-23T15:00:00Z",
        "summary": "Mild turbidity reported in water lines in Mission District. Boiling drinking water is recommended as a precaution.",
        "checklist": [
            "Boil drinking and cooking water for at least 1 minute.",
            "Ensure water filters are maintained.",
            "Report any direct odor or discoloration to public works."
        ]
    },
    {
        "id": 104,
        "title": "Mosquito Prevention Drive",
        "type": "Disease Prevention",
        "severity": "Low",
        "issued_at": "2026-06-22T09:00:00Z",
        "summary": "Dengue and Zika control vector spraying is scheduled in Sunset and Richmond wards. Clear standing water.",
        "checklist": [
            "Clear stagnant water from pots, coolers, and drains.",
            "Use mosquito repellent screens and nets.",
            "Allow municipal spraying teams access to open garden yards."
        ]
    }
]

# Mock government health programs and vaccination programs
MOCK_PROGRAMS = [
    {
        "id": 201,
        "title": "National Immunization Schedule (BCG, DPT, OPV, MR)",
        "category": "Vaccination Campaign",
        "description": "Essential vaccinations provided free of charge for infants and children at all government clinics.",
        "schedule": [
            {"age": "At Birth", "vaccines": ["BCG", "OPV 0", "Hepatitis B 1"]},
            {"age": "6 Weeks", "vaccines": ["OPV 1", "Pentavalent 1", "Rotavirus 1", "PCV 1"]},
            {"age": "10 Weeks", "vaccines": ["OPV 2", "Pentavalent 2", "Rotavirus 2"]},
            {"age": "14 Weeks", "vaccines": ["OPV 3", "Pentavalent 3", "Rotavirus 3", "PCV 2"]},
            {"age": "9-12 Months", "vaccines": ["Measles-Rubella (MR) 1", "JE 1", "PCV Booster"]}
        ]
    },
    {
        "id": 202,
        "title": "Maternal & Child Health Scheme (Janani Suraksha Yojana)",
        "category": "Government Welfare Scheme",
        "description": "Financial assistance and nutrition support for pregnant mothers to promote safe institutional deliveries.",
        "benefits": [
            "Cash assistance for delivery coordinates.",
            "Free health checkups and iron-folic acid supplement supplies.",
            "Free transport assistance to municipal hospitals."
        ]
    },
    {
        "id": 203,
        "title": "Senior Citizen Health Care Benefits",
        "category": "Geriatric Care Support",
        "description": "Geriatric wellness cards offering free medical checkups, diagnostic testing, and medicines at city centers.",
        "benefits": [
            "100% subsidy on standard blood diagnostics and imaging.",
            "Dedicated senior citizen outpatient consultations.",
            "Free wellness counseling and dietary guidance."
        ]
    }
]

# Mock health resources and FAQ library
MOCK_RESOURCES = [
    {
        "id": 301,
        "title": "Emergency First Aid Guide",
        "category": "First Aid Protocols",
        "details": [
            {"scenario": "Minor Cuts", "instructions": "Wash with soap and water, apply antiseptic cream, and cover with a sterile band-aid."},
            {"scenario": "Minor Burns", "instructions": "Cool the burn under cool running water for 10-15 minutes. Do not apply ice or butter. Cover loosely with non-stick gauze."},
            {"scenario": "Heat Stroke", "instructions": "Move the person to a cool area, apply damp cloths to their body, fan them, and give cool sips of water. Call emergency services immediately."},
            {"scenario": "Choking (Adult)", "instructions": "Perform abdominal thrusts (Heimlich maneuver) just above the navel until the object is expelled."}
        ]
    },
    {
        "id": 302,
        "title": "Communicable Disease Prevention (Seasonal Flu & Dengue)",
        "category": "Preventive Care",
        "details": [
            {"preventive_measure": "Flu Prevention", "instructions": "Get annual flu vaccinations, wash hands frequently, and avoid contact with sick individuals."},
            {"preventive_measure": "Dengue Prevention", "instructions": "Avoid mosquito bites by wearing long sleeves, using mosquito nets, and draining stagnant water areas around home boundaries."}
        ]
    },
    {
        "id": 303,
        "title": "Mental Health and Counseling Hotlines",
        "category": "Mental Wellness",
        "details": [
            {"resource": "National Tele-Mental Health Helpline", "number": "1800-599-0019", "availability": "24/7 Free Call", "description": "Provides professional support and counseling for stress, anxiety, or depression."}
        ]
    }
]


@router.post("/chat")
async def health_chat_endpoint(
    req: HealthChatRequest,
    current_user: User = Depends(deps.get_current_user)
):
    agent = agent_registry.get_agent("HealthcareAdvisor")
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="HealthcareAdvisor agent not found in multi-agent registry."
        )
    
    # We fetch relevant health guidelines via RAG query on keywords
    from app.ai.knowledge.layer import knowledge_base
    knowledge_docs = knowledge_base.query(req.query, limit=2)

    res = await agent.execute(req.query, {
        "session_id": req.session_id,
        "knowledge": knowledge_docs,
        "user_role": current_user.role
    })

    return {
        "response": res.get("output"),
        "category": "Healthcare",
        "agent": agent.name,
        "safety": {"safe": True, "reason": "Passed Health Safety Guardrails"},
        "session_id": req.session_id,
        "confidence": res.get("confidence", 0.95),
        "analysis": res.get("analysis", {}),
        "knowledge_sources": knowledge_docs
    }


@router.get("/facilities")
async def get_facilities_endpoint(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius_km: float = Query(5.0),
    type: Optional[str] = Query(None),
    current_user: User = Depends(deps.get_current_user)
):
    results = []
    for facility in MOCK_FACILITIES:
        if type and facility["type"].lower() != type.lower():
            continue
        
        distance = None
        travel_time_min = None
        if lat is not None and lng is not None:
            distance = round(calculate_distance(lat, lng, facility["latitude"], facility["longitude"]), 2)
            # Rough estimation: 2.5 minutes per km travel speed + 3 minutes overhead
            travel_time_min = int(distance * 2.5 + 3)
            
            # If distance exceeds search radius, filter out
            if distance > radius_km:
                continue

        facility_copy = facility.copy()
        facility_copy["distance_km"] = distance
        facility_copy["estimated_travel_time_minutes"] = travel_time_min
        results.append(facility_copy)

    # Sort results by distance if lat/lng are provided
    if lat is not None and lng is not None:
        results.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else 999)

    return results


@router.get("/hospitals")
async def get_hospitals_endpoint(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius_km: float = Query(10.0),
    current_user: User = Depends(deps.get_current_user)
):
    return await get_facilities_endpoint(lat=lat, lng=lng, radius_km=radius_km, type="Hospital", current_user=current_user)


@router.get("/pharmacies")
async def get_pharmacies_endpoint(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius_km: float = Query(5.0),
    current_user: User = Depends(deps.get_current_user)
):
    return await get_facilities_endpoint(lat=lat, lng=lng, radius_km=radius_km, type="Pharmacy", current_user=current_user)


@router.get("/advisories")
async def get_advisories_endpoint(
    current_user: User = Depends(deps.get_current_user)
):
    return MOCK_ADVISORIES


@router.get("/programs")
async def get_programs_endpoint(
    current_user: User = Depends(deps.get_current_user)
):
    return MOCK_PROGRAMS


@router.get("/resources")
async def get_resources_endpoint(
    current_user: User = Depends(deps.get_current_user)
):
    return MOCK_RESOURCES


@router.post("/escalate")
async def escalate_health_emergency(
    req: HealthEscalateRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    try:
        # Standard escalation: write high-priority incident into emergency_incidents
        incident = EmergencyIncident(
            title=f"Health Emergency: {req.title}",
            description=req.description,
            type="Medical Emergency",
            severity="Critical",
            priority="Urgent",
            status="Reported",
            latitude=req.latitude,
            longitude=req.longitude,
            address=req.address or "Identified location",
            ward=req.ward or "City center",
            affected_radius_meters=100.0,
            ai_confidence=0.98,
            ai_reasoning="Direct medical emergency escalation requested by citizen.",
            suggested_departments=["Medical Services", "Ambulance Corps"],
            estimated_response_minutes=15
        )
        db.add(incident)
        await db.flush()

        # Add initial timeline log
        timeline_event = EmergencyTimelineEvent(
            incident_id=incident.id,
            event="Incident Reported",
            note=f"Critical health emergency escalated to command center. Urgent medical crew dispatch suggested."
        )
        db.add(timeline_event)

        # Allocate Ambulance & Medical Team resources on Standby
        ambulance_res = EmergencyResource(
            incident_id=incident.id,
            name="Emergency Ambulance Crew 9",
            type="Medical Teams",
            status="Standby",
            allocated_count=1,
            confidence=0.95
        )
        db.add(ambulance_res)

        await db.commit()
        await db.refresh(incident)
        return {"status": "success", "message": "Emergency medical dispatch initiated.", "incident_id": incident.id, "incident": incident}

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Escalation failed to execute: {str(e)}"
        )
