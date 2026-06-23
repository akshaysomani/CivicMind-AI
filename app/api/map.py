import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status as http_status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.report import Report
from app.models.gis import Ward, AdminBoundary
from app.utils.spatial import point_in_geojson, haversine_distance

router = APIRouter(prefix="/map", tags=["Interactive GIS Map"])

# ── GET /map/issues ──────────────────────────────────────────────────────────
@router.get("/issues")
async def get_map_issues(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Return all active issues with geospatial properties.
    Masks reporter details based on the user's role to comply with RBAC scopes.
    """
    result = await db.execute(
        select(Report)
        .options(
            selectinload(Report.citizen),
            selectinload(Report.attachments),
            selectinload(Report.assigned_officer)
        )
        .where(Report.is_deleted == False)
    )
    reports = result.scalars().all()
    
    out = []
    for r in reports:
        if r.latitude is None or r.longitude is None:
            continue
            
        # Determine reporter details based on RBAC
        reporter_info = None
        if current_user.role in ("Government", "Admin"):
            reporter_info = {
                "name": "Anonymous" if r.is_anonymous else f"{r.citizen.first_name} {r.citizen.last_name}",
                "phone": "N/A" if r.is_anonymous else r.citizen.phone,
                "email": "N/A" if r.is_anonymous else r.citizen.email
            }
        else:
            # Citizen role
            if r.citizen_id == current_user.id:
                # User owns the issue
                reporter_info = {
                    "name": f"{current_user.first_name} {current_user.last_name}",
                    "phone": current_user.phone,
                    "email": current_user.email
                }
            else:
                # Masked for other users
                reporter_info = {
                    "name": "Anonymous Citizen" if r.is_anonymous else "Citizen (Masked)",
                    "phone": "Masked",
                    "email": "Masked"
                }
                
        # Assigned officer info
        officer_info = None
        if r.assigned_officer:
            officer_info = {
                "name": f"{r.assigned_officer.first_name} {r.assigned_officer.last_name}",
                "email": r.assigned_officer.email
            }
            
        attachments_info = [
            {
                "id": a.id,
                "filename": a.filename,
                "file_path": a.file_path,
                "file_type": a.file_type
            }
            for a in r.attachments
        ]
        
        out.append({
            "id": r.id,
            "complaint_id": r.complaint_id,
            "title": r.title,
            "description": r.description,
            "category": r.category,
            "priority": r.priority,
            "severity": r.severity,
            "status": r.status,
            "progress": r.progress,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "ward": r.ward,
            "assigned_department": r.assigned_department,
            "estimated_response_hours": r.estimated_response_hours,
            "created_at": r.created_at,
            "reporter": reporter_info,
            "assigned_officer": officer_info,
            "attachments": attachments_info
        })
    return out


# ── GET /map/layers ──────────────────────────────────────────────────────────
@router.get("/layers")
async def get_map_layers(
    current_user: User = Depends(get_current_user)
):
    """
    Exposes GeoJSON infrastructure layers and city amenities.
    Includes Schools, Healthcare, Police, Fire, Transit, Water Bodies, Flood Zones, and Road network.
    """
    # 1. Mock Amenity Markers (Point Features)
    police_stations = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "Richmond Police Station", "type": "Police", "address": "461 6th Ave"},
                "geometry": {"type": "Point", "coordinates": [-122.4644, 37.7799]}
            },
            {
                "type": "Feature",
                "properties": {"name": "Mission Police Station", "type": "Police", "address": "630 Valencia St"},
                "geometry": {"type": "Point", "coordinates": [-122.4219, 37.7628]}
            }
        ]
    }
    
    fire_stations = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "SF Fire Station 1", "type": "Fire", "address": "935 Folsom St"},
                "geometry": {"type": "Point", "coordinates": [-122.4054, 37.7865]}
            },
            {
                "type": "Feature",
                "properties": {"name": "SF Fire Station 8", "type": "Fire", "address": "36 Bluxome St"},
                "geometry": {"type": "Point", "coordinates": [-122.4024, 37.8028]}
            }
        ]
    }
    
    healthcare = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "UCSF Medical Center", "type": "Healthcare", "address": "505 Parnassus Ave"},
                "geometry": {"type": "Point", "coordinates": [-122.4578, 37.7631]}
            },
            {
                "type": "Feature",
                "properties": {"name": "Zuckerberg SF General Hospital", "type": "Healthcare", "address": "1001 Potrero Ave"},
                "geometry": {"type": "Point", "coordinates": [-122.4048, 37.7554]}
            }
        ]
    }
    
    schools = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "Lowell High School", "type": "School", "address": "1101 Eucalyptus Dr"},
                "geometry": {"type": "Point", "coordinates": [-122.4828, 37.7289]}
            },
            {
                "type": "Feature",
                "properties": {"name": "Galileo Academy of Science & Technology", "type": "School", "address": "1150 Francisco St"},
                "geometry": {"type": "Point", "coordinates": [-122.4258, 37.8041]}
            }
        ]
    }
    
    government_offices = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "San Francisco City Hall", "type": "Government", "address": "1 Dr Carlton B Goodlett Pl"},
                "geometry": {"type": "Point", "coordinates": [-122.4192, 37.7793]}
            }
        ]
    }
    
    transit = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "Powell St BART Station", "type": "Transit"},
                "geometry": {"type": "Point", "coordinates": [-122.4080, 37.7844]}
            },
            {
                "type": "Feature",
                "properties": {"name": "Civic Center BART Station", "type": "Transit"},
                "geometry": {"type": "Point", "coordinates": [-122.4141, 37.7797]}
            }
        ]
    }
    
    # 2. Polygons and Lines
    water_bodies = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "Stow Lake", "type": "WaterBody"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [-122.4795, 37.7690],
                            [-122.4785, 37.7700],
                            [-122.4770, 37.7695],
                            [-122.4780, 37.7680],
                            [-122.4795, 37.7690]
                        ]
                    ]
                }
            }
        ]
    }
    
    flood_zones = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "Embarcadero Lowlands High-Risk Zone", "severity": "High"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [-122.3980, 37.7950],
                            [-122.3920, 37.7990],
                            [-122.3940, 37.8030],
                            [-122.4000, 37.7980],
                            [-122.3980, 37.7950]
                        ]
                    ]
                }
            }
        ]
    }
    
    road_network = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "Market Street Corridor"},
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [-122.4410, 37.7620],
                        [-122.4180, 37.7780],
                        [-122.4080, 37.7840],
                        [-122.3930, 37.7950]
                    ]
                }
            }
        ]
    }

    return {
        "police": police_stations,
        "fire": fire_stations,
        "healthcare": healthcare,
        "schools": schools,
        "government": government_offices,
        "public_transport": transit,
        "water_bodies": water_bodies,
        "flood_zones": flood_zones,
        "road_network": road_network
    }


# ── GET /map/wards ───────────────────────────────────────────────────────────
@router.get("/wards")
async def get_map_wards(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns municipal wards, including polygons boundaries, population, total issues,
    resolved counts, resolution %, and top categories breakdown.
    """
    wards_res = await db.execute(select(Ward))
    wards = wards_res.scalars().all()
    
    reports_res = await db.execute(select(Report).where(Report.is_deleted == False))
    reports = reports_res.scalars().all()
    
    out = []
    for w in wards:
        # Check point in ward boundary polygon
        ward_reports = []
        for r in reports:
            if r.ward == w.name:
                ward_reports.append(r)
            elif r.latitude is not None and r.longitude is not None:
                if point_in_geojson(r.latitude, r.longitude, w.geojson_polygon):
                    ward_reports.append(r)
                    
        total_count = len(ward_reports)
        resolved_count = len([r for r in ward_reports if r.status in ("Resolved", "Closed")])
        pending_count = total_count - resolved_count
        resolved_pct = (resolved_count / total_count * 100) if total_count > 0 else 100.0
        pending_pct = 100.0 - resolved_pct
        
        # Aggregate category counts
        cat_counts = {}
        for r in ward_reports:
            cat_counts[r.category] = cat_counts.get(r.category, 0) + 1
        sorted_cats = sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)
        top_categories = [{"category": k, "count": v} for k, v in sorted_cats[:3]]
        
        # Hardcoded department performance metrics for UX demonstration
        dept_performance = {
            "Public Works": 91.5 if "Richmond" in w.name else 88.0,
            "Sanitation": 89.0 if "Mission" in w.name else 92.0,
            "Electricity": 95.0 if "Marina" in w.name else 90.0,
            "Water & Sewage": 86.4 if "Sunset" in w.name else 89.0
        }
        
        out.append({
            "id": w.id,
            "name": w.name,
            "city": w.city,
            "population": w.population,
            "geojson_polygon": json.loads(w.geojson_polygon),
            "issue_count": total_count,
            "resolved_count": resolved_count,
            "pending_count": pending_count,
            "resolved_pct": round(resolved_pct, 1),
            "pending_pct": round(pending_pct, 1),
            "department_performance": dept_performance,
            "top_categories": top_categories,
            "trend": [10, 14, 12, 8, total_count]
        })
    return out


# ── GET /map/boundaries ──────────────────────────────────────────────────────
@router.get("/boundaries")
async def get_map_boundaries(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns administrative city boundaries as GeoJSON.
    """
    result = await db.execute(select(AdminBoundary))
    boundary = result.scalars().first()
    if not boundary:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="City administrative boundary coordinates not found."
        )
    return {
        "id": boundary.id,
        "name": boundary.name,
        "boundary_type": boundary.boundary_type,
        "geojson_polygon": json.loads(boundary.geojson_polygon)
    }


# ── GET /map/heatmap ─────────────────────────────────────────────────────────
@router.get("/heatmap")
async def get_map_heatmap(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns coordinate lists with weight scaling based on priority and severity for heatmap.
    """
    result = await db.execute(select(Report).where(Report.is_deleted == False))
    reports = result.scalars().all()
    
    weight_map = {
        "Low": 1.0,
        "Medium": 2.0,
        "High": 3.0,
        "Critical": 5.0
    }
    
    heatmap_points = []
    for r in reports:
        if r.latitude is not None and r.longitude is not None:
            heatmap_points.append({
                "latitude": r.latitude,
                "longitude": r.longitude,
                "weight": weight_map.get(r.priority, 1.0),
                "category": r.category
            })
    return heatmap_points


# ── GET /map/location ────────────────────────────────────────────────────────
@router.get("/location")
async def get_map_location(
    address: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Handles address geocoding and reverse geocoding fallback searches.
    """
    if address:
        addr = address.lower()
        if "market" in addr:
            return {"latitude": 37.7892, "longitude": -122.4014, "address": "Market St, San Francisco, CA"}
        elif "richmond" in addr or "22nd" in addr:
            return {"latitude": 37.7785, "longitude": -122.4820, "address": "Richmond District, San Francisco, CA"}
        elif "mission" in addr:
            return {"latitude": 37.7610, "longitude": -122.4162, "address": "Mission District, San Francisco, CA"}
        elif "marina" in addr:
            return {"latitude": 37.8035, "longitude": -122.4371, "address": "Marina District, San Francisco, CA"}
        elif "sunset" in addr:
            return {"latitude": 37.7510, "longitude": -122.4760, "address": "Sunset District, San Francisco, CA"}
        return {"latitude": 37.7749, "longitude": -122.4194, "address": address}
    
    if lat is not None and lng is not None:
        wards_res = await db.execute(select(Ward))
        wards = wards_res.scalars().all()
        matched_ward = "San Francisco"
        for w in wards:
            if point_in_geojson(lat, lng, w.geojson_polygon):
                matched_ward = w.name
                break
        return {
            "latitude": lat,
            "longitude": lng,
            "address": f"{matched_ward}, San Francisco, CA, USA",
            "ward": matched_ward
        }
        
    raise HTTPException(
        status_code=http_status.HTTP_400_BAD_REQUEST,
        detail="Must provide either address or lat/lng parameters."
    )


# ── GET /map/nearby ──────────────────────────────────────────────────────────
@router.get("/nearby")
async def get_map_nearby(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: float = Query(2.0, description="Radius in kilometers"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns reports and city infrastructure entities situated within a specific radius of coordinates.
    """
    result = await db.execute(
        select(Report)
        .options(selectinload(Report.citizen))
        .where(Report.is_deleted == False)
    )
    reports = result.scalars().all()
    
    nearby_issues = []
    for r in reports:
        if r.latitude is not None and r.longitude is not None:
            dist = haversine_distance(lat, lng, r.latitude, r.longitude)
            if dist <= radius:
                # Mask reporter info if citizen
                reporter_info = None
                if current_user.role in ("Government", "Admin"):
                    reporter_info = {
                        "name": "Anonymous" if r.is_anonymous else f"{r.citizen.first_name} {r.citizen.last_name}",
                        "phone": "N/A" if r.is_anonymous else r.citizen.phone,
                        "email": "N/A" if r.is_anonymous else r.citizen.email
                    }
                else:
                    if r.citizen_id == current_user.id:
                        reporter_info = {
                            "name": f"{current_user.first_name} {current_user.last_name}",
                            "phone": current_user.phone,
                            "email": current_user.email
                        }
                    else:
                        reporter_info = {"name": "Anonymous Citizen" if r.is_anonymous else "Citizen (Masked)", "phone": "Masked", "email": "Masked"}
                        
                nearby_issues.append({
                    "id": r.id,
                    "title": r.title,
                    "complaint_id": r.complaint_id,
                    "category": r.category,
                    "priority": r.priority,
                    "status": r.status,
                    "latitude": r.latitude,
                    "longitude": r.longitude,
                    "distance_km": round(dist, 2),
                    "reporter": reporter_info
                })
                
    # Amenities distance lookup
    amenities = [
        {"name": "Richmond Police Station", "type": "Police Station", "lat": 37.7799, "lng": -122.4644},
        {"name": "Mission Police Station", "type": "Police Station", "lat": 37.7628, "lng": -122.4219},
        {"name": "UCSF Medical Center", "type": "Healthcare Facility", "lat": 37.7631, "lng": -122.4578},
        {"name": "SF Fire Station 1", "type": "Fire Station", "lat": 37.7865, "lng": -122.4054},
        {"name": "San Francisco City Hall", "type": "Government Office", "lat": 37.7793, "lng": -122.4192}
    ]
    
    nearby_amenities = []
    for a in amenities:
        dist = haversine_distance(lat, lng, a["lat"], a["lng"])
        if dist <= radius:
            nearby_amenities.append({
                "name": a["name"],
                "type": a["type"],
                "latitude": a["lat"],
                "longitude": a["lng"],
                "distance_km": round(dist, 2)
            })
            
    return {
        "issues": nearby_issues,
        "amenities": nearby_amenities
    }


# ── GET /map/statistics ──────────────────────────────────────────────────────
@router.get("/statistics")
async def get_map_statistics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns visibility metrics, priority distribution, top wards, and resolution speeds.
    """
    result = await db.execute(select(Report).where(Report.is_deleted == False))
    reports = result.scalars().all()
    
    total = len(reports)
    categories = {}
    priorities = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    resolved = 0
    
    for r in reports:
        categories[r.category] = categories.get(r.category, 0) + 1
        priorities[r.priority] = priorities.get(r.priority, 0) + 1
        if r.status in ("Resolved", "Closed"):
            resolved += 1
            
    resolution_rate = (resolved / total * 100) if total > 0 else 100.0
    most_common_cat = max(categories.items(), key=lambda x: x[1])[0] if categories else "None"
    
    ward_counts = {}
    for r in reports:
        if r.ward:
            ward_counts[r.ward] = ward_counts.get(r.ward, 0) + 1
    top_ward = max(ward_counts.items(), key=lambda x: x[1])[0] if ward_counts else "None"
    
    recent_reports = [
        {
            "id": r.id,
            "title": r.title,
            "category": r.category,
            "priority": r.priority,
            "status": r.status,
            "created_at": r.created_at
        }
        for r in sorted(reports, key=lambda x: x.created_at, reverse=True)[:5]
    ]
    
    return {
        "total_issues": total,
        "resolution_rate": round(resolution_rate, 1),
        "most_common_category": most_common_cat,
        "top_ward": top_ward,
        "category_distribution": categories,
        "priority_distribution": priorities,
        "recent_reports": recent_reports
    }
