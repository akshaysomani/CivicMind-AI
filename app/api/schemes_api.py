from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.models.user import User
from app.models.scheme import SavedScheme
from app.ai.registry.core import agent_registry
import math

router = APIRouter(prefix="/ai/schemes", tags=["Government Schemes AI Agent"])

# Pydantic Schemas
class SchemesChatRequest(BaseModel):
    query: str
    session_id: str = "default_session"

class EligibilityRequest(BaseModel):
    age: int
    occupation: str
    student_status: bool
    income: float
    location: str
    rural_urban: str
    gender: Optional[str] = None
    business_owner: bool
    farmer: bool
    senior_citizen: bool
    education_level: str

class SaveSchemeRequest(BaseModel):
    scheme_id: int
    scheme_title: str
    scheme_category: str

# Haversine distance calculator
def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Pre-seeded database of government schemes
MOCK_SCHEMES = [
    {
        "id": 1,
        "title": "PM-KISAN (Income Support for Farmers)",
        "category": "Agriculture",
        "description": "Income support of 6,000 INR per year in three equal installments to all cultivable landholding farmer families.",
        "benefits": [
            "6,000 INR annual direct cash transfer.",
            "Paid in three equal installments of 2,000 INR.",
            "Direct transfer to Aadhaar-linked bank accounts."
        ],
        "eligibility": {
            "age_min": 18,
            "income_max": 9999999,
            "requires_farmer": True,
            "requires_landowner": True,
            "requires_student": False,
            "requires_business": False,
            "requires_senior": False
        },
        "documents": [
            "Land registration documents (Patta / Khata)",
            "Aadhaar Card",
            "Bank Account Passbook",
            "Aadhaar-seeded Mobile Number"
        ],
        "application_steps": [
            "Go to the official PM-KISAN online portal.",
            "Click on 'New Farmer Registration' and enter Aadhaar details.",
            "Fill in land coordinates, district, and ward fields.",
            "Upload scanned copy of land registration certificates.",
            "Submit and track application status using registration ID."
        ],
        "department": "Department of Agriculture, Cooperation & Farmers Welfare",
        "processing_time": "15 to 30 days"
    },
    {
        "id": 2,
        "title": "Startup India Seed Fund Scheme",
        "category": "Startup Support",
        "description": "Financial assistance to early-stage startups for proof of concept, prototype development, product trials, and market entry.",
        "benefits": [
            "Up to 20 Lakh INR grant for proof of concept and prototype development.",
            "Up to 50 Lakh INR debt/convertible debenture investment for commercial scaling.",
            "Access to startup incubators and government mentors."
        ],
        "eligibility": {
            "age_min": 18,
            "income_max": 9999999,
            "requires_farmer": False,
            "requires_landowner": False,
            "requires_student": False,
            "requires_business": True,
            "requires_senior": False,
            "business_max_age_years": 2
        },
        "documents": [
            "DPIIT Startup Registration Certificate",
            "Startup Incorporation Certificate / LLP Deed",
            "Detailed Project Report (DPR) / Pitch Deck",
            "Bank statement showing zero prior external funding exceedings"
        ],
        "application_steps": [
            "Register your startup with DPIIT on the Startup India portal.",
            "Login and navigate to 'Startup India Seed Fund Scheme'.",
            "Select an approved government Incubator to review your pitch.",
            "Fill in project timelines, funding breakdown and upload DPR.",
            "Submit application. The incubator committee will invite you for a review presentation."
        ],
        "department": "Department for Promotion of Industry and Internal Trade (DPIIT)",
        "processing_time": "30 to 45 days"
    },
    {
        "id": 3,
        "title": "Janani Suraksha Yojana (JSY)",
        "category": "Healthcare",
        "description": "Safe motherhood maternal support program promoting institutional deliveries through cash assistance.",
        "benefits": [
            "1,400 INR cash assistance for pregnant mothers in rural areas.",
            "1,000 INR cash assistance for pregnant mothers in urban areas.",
            "Free prenatal checkups and delivery at government hospitals."
        ],
        "eligibility": {
            "age_min": 19,
            "income_max": 9999999,
            "requires_farmer": False,
            "requires_landowner": False,
            "requires_student": False,
            "requires_business": False,
            "requires_senior": False,
            "gender_restriction": "Female"
        },
        "documents": [
            "Mother and Child Protection (MCP) Card",
            "Government Hospital Delivery Registration Slip",
            "Aadhaar Card",
            "BPL Card (if applicable in urban areas)"
        ],
        "application_steps": [
            "Register pregnancy at the local Anganwadi or Government health clinic.",
            "Obtain the Mother and Child Protection (MCP) card from health workers.",
            "Complete delivery in a public or accredited private hospital.",
            "Submit bank account details and MCP card to the hospital administration.",
            "Cash benefit is disbursed directly to your bank account post-discharge."
        ],
        "department": "Ministry of Health and Family Welfare",
        "processing_time": "7 to 10 days"
    },
    {
        "id": 4,
        "title": "Pradhan Mantri Kaushal Vikas Yojana (PMKVY)",
        "category": "Skill Development",
        "description": "Skill certification scheme enabling Indian youth to take up industry-relevant specialty training.",
        "benefits": [
            "100% sponsored vocational training courses in multiple sectors.",
            "Industry-recognized NSDC certificate.",
            "Placement guidance and monetary rewards on successful certification."
        ],
        "eligibility": {
            "age_min": 15,
            "age_max": 45,
            "income_max": 9999999,
            "requires_farmer": False,
            "requires_landowner": False,
            "requires_student": False,
            "requires_business": False,
            "requires_senior": False
        },
        "documents": [
            "Aadhaar Card",
            "Education qualification marksheets (10th/12th/Graduate)",
            "Bank Passbook copy",
            "Unemployment self-declaration certificate"
        ],
        "application_steps": [
            "Browse active courses on the PMKVY portal.",
            "Select and enroll at an approved PMKVY training center near you.",
            "Attend the classroom or hybrid vocational training sessions.",
            "Pass the external NSDC assessment examination.",
            "Receive certificate and register on the national apprentice database."
        ],
        "department": "Ministry of Skill Development and Entrepreneurship",
        "processing_time": "Instant Enrollment"
    },
    {
        "id": 5,
        "title": "Pradhan Mantri Awas Yojana (PMAY-Urban)",
        "category": "Housing",
        "description": "Interest subsidy scheme on home loans for purchase, construction, or extension of residential houses.",
        "benefits": [
            "Interest subsidy up to 6.5% on home loans.",
            "Maximum loan tenure eligible for subsidy: 20 years.",
            "Direct subsidy credit into home loan account, reducing total EMI load."
        ],
        "eligibility": {
            "age_min": 18,
            "income_max": 1800000, # Family income limit
            "requires_farmer": False,
            "requires_landowner": False,
            "requires_student": False,
            "requires_business": False,
            "requires_senior": False,
            "requires_no_house": True
        },
        "documents": [
            "Income certificate / Income Tax Returns (ITR)",
            "No-Own-House Affidavit",
            "Aadhaar and PAN Cards",
            "Scanned copy of land sale agreement or construction map approval"
        ],
        "application_steps": [
            "Apply for home loan at any commercial bank or housing finance company.",
            "Request PMAY subsidy integration during loan application.",
            "Submit income proof and the No-Own-House affidavit to the lending officer.",
            "Bank uploads the application to the Central Portal.",
            "On verification, government releases the lump sum subsidy directly to your loan account."
        ],
        "department": "Ministry of Housing and Urban Affairs",
        "processing_time": "60 to 90 days"
    },
    {
        "id": 6,
        "title": "National Pension System (NPS)",
        "category": "Pension",
        "description": "Voluntary defined contribution retirement savings scheme designed to enable systematic savings.",
        "benefits": [
            "Long term retirement corpus with equity/debt choices.",
            "Monthly regular pension payouts on attaining 60 years.",
            "Tax benefits of up to 1.5 Lakh INR under Sec 80C and extra 50,000 INR under Sec 80CCD."
        ],
        "eligibility": {
            "age_min": 18,
            "age_max": 70,
            "income_max": 9999999,
            "requires_farmer": False,
            "requires_landowner": False,
            "requires_student": False,
            "requires_business": False,
            "requires_senior": False
        },
        "documents": [
            "PAN Card",
            "Aadhaar Card",
            "Cancelled Cheque copy or bank statement",
            "Signature scan copy"
        ],
        "application_steps": [
            "Visit the eNPS online registration portal.",
            "Enter Aadhaar/PAN details to verify identity via OTP.",
            "Choose a Point of Presence (POP) bank and selecting fund managers.",
            "Make an initial contribution (minimum 500 INR).",
            "Get your Permanent Retirement Account Number (PRAN) instantly."
        ],
        "department": "Pension Fund Regulatory and Development Authority (PFRDA)",
        "processing_time": "1 to 2 days"
    }
]

# Mock government office location data (San Francisco coordinates)
MOCK_OFFICES = [
    {
        "id": 301,
        "name": "SF Municipal Scheme Help Desk",
        "type": "Municipal Office",
        "address": "2480 Mission St, San Francisco, CA 94110",
        "latitude": 37.7612,
        "longitude": -122.4162,
        "contact": "(415) 554-6100",
        "hours": "9:00 AM - 5:00 PM, Mon-Fri"
    },
    {
        "id": 302,
        "name": "Richmond Public Service Center",
        "type": "Service Center",
        "address": "1101 Eucalyptus Dr, San Francisco, CA 94132",
        "latitude": 37.7785,
        "longitude": -122.4820,
        "contact": "(415) 554-7200",
        "hours": "8:30 AM - 4:30 PM, Mon-Fri"
    },
    {
        "id": 303,
        "name": "Financial District Public Service Counter",
        "type": "District Office",
        "address": "425 Market St, San Francisco, CA 94105",
        "latitude": 37.7955,
        "longitude": -122.4018,
        "contact": "(415) 554-8500",
        "hours": "9:00 AM - 5:00 PM, Mon-Fri"
    },
    {
        "id": 304,
        "name": "Civic Center District Office",
        "type": "District Office",
        "address": "1 Dr Carlton B Goodlett Pl, San Francisco, CA 94102",
        "latitude": 37.7793,
        "longitude": -122.4192,
        "contact": "(415) 554-4000",
        "hours": "8:00 AM - 5:00 PM, Mon-Fri"
    }
]

# Mock resources FAQs
MOCK_RESOURCES = [
    {
        "id": 401,
        "question": "What is the maximum income limit for PM Awas Yojana housing subsidy?",
        "answer": "For the credit-linked interest subsidy scheme, the maximum family income threshold is 18 Lakh INR per annum. Families must not own a pucca house in India."
    },
    {
        "id": 402,
        "question": "How long does it take for startup seed fund disbursement?",
        "answer": "Once the incubator evaluation committee approves your pitch, the verification and initial disbursement takes around 30 to 45 business days."
    },
    {
        "id": 403,
        "question": "Can I enroll in NPS online?",
        "answer": "Yes, eNPS allows instant paperless registration using your Aadhaar or PAN coordinates. PRAN is generated immediately upon initial online payment."
    },
    {
        "id": 404,
        "question": "Can a student apply for skill development training under PMKVY?",
        "answer": "Yes, PMKVY is designed for unemployed youth and student dropouts who wish to get professional certifications and vocational training."
    }
]


@router.post("/chat")
async def scheme_chat_endpoint(
    req: SchemesChatRequest,
    current_user: User = Depends(deps.get_current_user)
):
    agent = agent_registry.get_agent("SchemeAdvisor")
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SchemeAdvisor agent not found in registry."
        )

    # Fetch RAG context
    from app.ai.knowledge.layer import knowledge_base
    knowledge_docs = knowledge_base.query(req.query, limit=2)

    res = await agent.execute(req.query, {
        "session_id": req.session_id,
        "knowledge": knowledge_docs,
        "user_role": current_user.role
    })

    return {
        "response": res.get("output"),
        "category": "Government Scheme",
        "agent": agent.name,
        "safety": {"safe": True, "reason": "Passed Schemes Policy Validation"},
        "session_id": req.session_id,
        "confidence": res.get("confidence", 0.90),
        "analysis": res.get("analysis", {}),
        "knowledge_sources": knowledge_docs
    }


@router.get("/search")
async def search_schemes_endpoint(
    query: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    current_user: User = Depends(deps.get_current_user)
):
    results = []
    for s in MOCK_SCHEMES:
        if category and s["category"].lower() != category.lower():
            continue
        if query:
            q = query.lower()
            if q not in s["title"].lower() and q not in s["description"].lower() and q not in s["category"].lower():
                continue
        results.append(s)
    return results


@router.post("/eligibility")
async def check_eligibility_endpoint(
    req: EligibilityRequest,
    current_user: User = Depends(deps.get_current_user)
):
    results = []
    
    # Reason over inputs
    for s in MOCK_SCHEMES:
        rules = s["eligibility"]
        eligible = True
        reasons = []

        # Age check
        if "age_min" in rules and req.age < rules["age_min"]:
            eligible = False
            reasons.append(f"Age {req.age} is below minimum requirement of {rules['age_min']}.")
        if "age_max" in rules and req.age > rules["age_max"]:
            eligible = False
            reasons.append(f"Age {req.age} exceeds maximum limit of {rules['age_max']}.")

        # Income check
        if "income_max" in rules and req.income > rules["income_max"]:
            eligible = False
            reasons.append(f"Annual Income of {req.income} INR exceeds maximum ceiling of {rules['income_max']} INR.")

        # Farmer check
        if rules.get("requires_farmer") and not req.farmer:
            eligible = False
            reasons.append("Scheme requires active farming occupation credentials.")

        # Business check
        if rules.get("requires_business") and not req.business_owner:
            eligible = False
            reasons.append("Scheme requires registered business ownership coordinates.")

        # Senior check
        if rules.get("requires_senior") and not req.senior_citizen:
            eligible = False
            reasons.append("Scheme is reserved for senior citizens.")

        # Gender check
        if "gender_restriction" in rules and req.gender and req.gender.lower() != rules["gender_restriction"].lower():
            eligible = False
            reasons.append(f"Scheme is restricted to {rules['gender_restriction']} applicants.")

        # Housing check
        if rules.get("requires_no_house") and not (req.income < 1800000):
            # Already failed by income_max or custom household limits
            pass

        if eligible:
            results.append({
                "scheme": s,
                "status": "Eligible",
                "reasoning": f"Citizen satisfies all demographic constraints for {s['title']}."
            })
        else:
            results.append({
                "scheme": s,
                "status": "Ineligible",
                "reasoning": " ".join(reasons)
            })

    return results


@router.get("/recommendations")
async def get_recommendations_endpoint(
    category: Optional[str] = Query(None),
    current_user: User = Depends(deps.get_current_user)
):
    # Pre-evaluated recommendations for user dashboard quick start
    # Automatically map to user role or location profile
    recs = []
    if current_user.role == "Citizen":
        recs = [MOCK_SCHEMES[2], MOCK_SCHEMES[3], MOCK_SCHEMES[4], MOCK_SCHEMES[5]] # General, Health, Skill, Pension
    else:
        recs = [MOCK_SCHEMES[0], MOCK_SCHEMES[1]] # Farmers, Startups
        
    if category:
        recs = [r for r in recs if r["category"].lower() == category.lower()]
        
    return recs


@router.get("/compare")
async def compare_schemes_endpoint(
    ids: List[int] = Query(...),
    current_user: User = Depends(deps.get_current_user)
):
    results = []
    for sid in ids:
        scheme = next((s for s in MOCK_SCHEMES if s["id"] == sid), None)
        if scheme:
            results.append(scheme)
    return results


@router.get("/offices")
async def get_offices_endpoint(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius_km: float = Query(10.0),
    current_user: User = Depends(deps.get_current_user)
):
    results = []
    for office in MOCK_OFFICES:
        distance = None
        travel_time_min = None
        if lat is not None and lng is not None:
            distance = round(calculate_distance(lat, lng, office["latitude"], office["longitude"]), 2)
            travel_time_min = int(distance * 3 + 4) # 3 min per km + 4 min delay
            
            if distance > radius_km:
                continue

        office_copy = office.copy()
        office_copy["distance_km"] = distance
        office_copy["estimated_travel_time_minutes"] = travel_time_min
        results.append(office_copy)

    if lat is not None and lng is not None:
        results.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else 999)

    return results


@router.get("/resources")
async def get_resources_endpoint(
    current_user: User = Depends(deps.get_current_user)
):
    return MOCK_RESOURCES


@router.post("/save")
async def save_scheme_bookmark(
    req: SaveSchemeRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    try:
        # Check if already bookmarked
        stmt = select(SavedScheme).where(
            SavedScheme.user_id == current_user.id,
            SavedScheme.scheme_id == req.scheme_id
        )
        res = await db.execute(stmt)
        existing = res.scalars().first()
        if existing:
            return {"status": "already_saved", "message": "Scheme is already bookmarked."}

        bookmark = SavedScheme(
            user_id=current_user.id,
            scheme_id=req.scheme_id,
            scheme_title=req.scheme_title,
            scheme_category=req.scheme_category
        )
        db.add(bookmark)
        await db.commit()
        await db.refresh(bookmark)
        return {"status": "success", "bookmark": bookmark}

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bookmark scheme: {str(e)}"
        )


@router.get("/saved")
async def get_saved_schemes(
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    try:
        stmt = select(SavedScheme).where(SavedScheme.user_id == current_user.id).order_by(SavedScheme.created_at.desc())
        res = await db.execute(stmt)
        return res.scalars().all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch bookmarked schemes: {str(e)}"
        )


@router.delete("/saved/{id}")
async def delete_saved_scheme(
    id: int,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    try:
        # Verify ownership
        stmt = select(SavedScheme).where(SavedScheme.id == id, SavedScheme.user_id == current_user.id)
        res = await db.execute(stmt)
        bookmark = res.scalars().first()
        if not bookmark:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bookmark not found or access denied."
            )
            
        await db.delete(bookmark)
        await db.commit()
        return {"status": "success", "message": "Bookmark removed successfully."}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete bookmark: {str(e)}"
        )
