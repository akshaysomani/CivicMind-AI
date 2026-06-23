import json
import math
from typing import List, Dict, Any, Union

def point_in_ring(x: float, y: float, ring: List[List[float]]) -> bool:
    """
    Ray-casting algorithm to check if point (x, y) is inside a single ring.
    x: longitude, y: latitude.
    ring: List of [lng, lat] coordinate pairs.
    """
    num = len(ring)
    if num < 3:
        return False
    
    # Standard ray casting
    c = False
    j = num - 1
    for i in range(num):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        
        # Check boundary intersection
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / ((yj - yi) if (yj - yi) != 0 else 1e-9) + xi):
            c = not c
        j = i
    return c


def point_in_polygon_coords(x: float, y: float, coords: List[List[List[float]]]) -> bool:
    """
    Check if point (x, y) is inside a Polygon geometry coordinates.
    coords[0] is the outer boundary ring.
    coords[1:] are hole boundary rings.
    """
    if not coords:
        return False
    
    # Point must be inside the outer boundary ring
    if not point_in_ring(x, y, coords[0]):
        return False
        
    # Point must NOT be inside any hole
    for hole in coords[1:]:
        if point_in_ring(x, y, hole):
            return False
            
    return True


def point_in_geojson(lat: float, lng: float, geojson_str: str) -> bool:
    """
    Checks if a point (lat, lng) is within a GeoJSON Polygon or MultiPolygon string.
    """
    try:
        geom = json.loads(geojson_str)
    except Exception:
        return False

    # Extract geometry type and coordinates
    geom_type = geom.get("type")
    coords = geom.get("coordinates")
    if not geom_type or not coords:
        # Check if it is a Feature
        if geom.get("type") == "Feature":
            geometry = geom.get("geometry", {})
            geom_type = geometry.get("type")
            coords = geometry.get("coordinates")
        else:
            return False

    x, y = lng, lat # Convert to [lng, lat] format matching GeoJSON standard

    if geom_type == "Polygon":
        return point_in_polygon_coords(x, y, coords)
    elif geom_type == "MultiPolygon":
        # MultiPolygon coordinates is List[PolygonCoordinates]
        for poly_coords in coords:
            if point_in_polygon_coords(x, y, poly_coords):
                return True
        return False
    elif geom_type == "GeometryCollection":
        geometries = geom.get("geometries", [])
        for sub_geom in geometries:
            sub_type = sub_geom.get("type")
            sub_coords = sub_geom.get("coordinates")
            if sub_type == "Polygon":
                if point_in_polygon_coords(x, y, sub_coords):
                    return True
            elif sub_type == "MultiPolygon":
                for poly_coords in sub_coords:
                    if point_in_polygon_coords(x, y, poly_coords):
                        return True
        return False

    return False


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the earth
    in kilometers (km).
    """
    # Convert decimal degrees to radians
    r_lat1, r_lon1, r_lat2, r_lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    d_lat = r_lat2 - r_lat1
    d_lon = r_lon2 - r_lon1
    a = math.sin(d_lat / 2.0)**2 + math.cos(r_lat1) * math.cos(r_lat2) * math.sin(d_lon / 2.0)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371.0 # Radius of earth in kilometers
    return c * r
