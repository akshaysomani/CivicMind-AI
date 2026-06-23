# GIS & Geospatial Intelligence Architecture Guide

This guide details the structural layout, backend database models, point-in-polygon containment checks, API endpoint signatures, and frontend rendering design for the CivicMind AI GIS Map platform.

---

## 📂 Architecture Overview

The CivicMind GIS visual intelligence layer follows a decoupled architecture, abstracting geospatial models, python-level geometry checks, standard REST routing endpoints, and modular frontend map renderers (Leaflet / Google Maps Platform).

```
               +----------------------------------------+
               |          Citizen/Officer Client        |
               +----------------------------------------+
                                    |
                                    v
                       [src/services/mapService.ts]
                                    |
                                    v
                        +----------------------+
                        |     FastAPI App      |
                        +----------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------------------+                       +-----------------------+
|  [app/api/map.py]     |                       | [app/utils/spatial.py]|
|  REST endpoints API   |                       | Ray-casting Point In  |
+-----------------------+                       | Polygon Calculations  |
            |                                   +-----------------------+
            v
+-----------------------+
|   SQLite Database     |
|   (standard tables)   |
+-----------------------+
```

---

## 💾 Database & Model Design

To maintain zero-dependency local development and make the SQLite database highly portable across environments, spatial geometries (polygons and routes) are stored as raw text representation of GeoJSON coordinate collections, rather than requiring complex binary compiled SpatiaLite extensions.

### 1. `Ward` Model
* **TableName**: `wards`
* **Fields**:
  * `id` (Integer, Primary Key)
  * `name` (String, unique Index) - e.g., "Ward 1 - Richmond"
  * `city` (String) - e.g., "San Francisco"
  * `population` (Integer) - demographic count placeholder
  * `geojson_polygon` (Text) - GeoJSON representation of the ward bounds coordinates polygon
  * `created_at` (DateTime)
  * `updated_at` (DateTime)

### 2. `AdminBoundary` Model
* **TableName**: `admin_boundaries`
* **Fields**:
  * `id` (Integer, Primary Key)
  * `name` (String, unique Index)
  * `boundary_type` (String) - e.g., "City", "District"
  * `geojson_polygon` (Text) - GeoJSON polygon coordinates defining municipal bounds
  * `created_at` (DateTime)
  * `updated_at` (DateTime)

---

## 🗺️ Point-In-Polygon Calculations

Point containment checking is handled natively in Python using the Ray-Casting algorithm (`app/utils/spatial.py`).

For a point `P(lat, lng)` and a Polygon polygon ring `V`, we cast a horizontal ray to the right of `P`. We count how many times the ray intersects the polygon's edges. An odd number of intersections means the point is inside; an even number means it is outside:

```python
def point_in_ring(x: float, y: float, ring: List[List[float]]) -> bool:
    num = len(ring)
    c = False
    j = num - 1
    for i in range(num):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            c = not c
        j = i
    return c
```

We extend this to check if a point lies within the outer boundary ring and not in any internal hole.

---

## 🔌 API Endpoints Reference

All routing endpoints are registered under prefix `/api/v1/map` and require standard bearer authorization.

### 1. `GET /map/issues`
* **Response**: List of reported issues containing `latitude`, `longitude`, priority, status, category, title, description, and attachments.
* **RBAC Masking**:
  * If the caller role is `Government` or `Admin`, returns the full reporter name, email, and phone.
  * If the caller role is `Citizen`, reporter identity is masked as `"Citizen (Masked)"` with phone/email set to `"Masked"`, unless the issue belongs to the caller.

### 2. `GET /map/layers`
* **Response**: GeoJSON feature collections for city infrastructure markers (Hospitals, Police, Fire, Schools, Government Offices, BART transit stations) and lines/polygons (water bodies, transit corridors).

### 3. `GET /map/wards`
* **Response**: List of municipal wards, containing their demographic data, GeoJSON bounds, issue counts, resolved % metrics, and dynamic SLA scores.

### 4. `GET /map/boundaries`
* **Response**: City boundaries GeoJSON coordinates.

### 5. `GET /map/heatmap`
* **Response**: Lists of active coordinates paired with priority weights for density heatmap rendering.

### 6. `GET /map/location`
* **Params**: `address` (optional), `lat` / `lng` (optional)
* **Response**: Bounding coordinates for address search (forward geocoding) or address string for coordinates (reverse geocoding).

### 7. `GET /map/nearby`
* **Params**: `lat`, `lng`, `radius` (in km)
* **Response**: Issues and infrastructure situated within the given radius (using the Haversine distance formula).

### 8. `GET /map/statistics`
* **Response**: Summary aggregates of total visible issues, category breakdown, priority distribution, top ward, and SLA speed ratios.

---

## 🎨 UI Component Architecture

Map views are rendered under a unified full-screen page (`GisMapPage.tsx`) composed of clean, glassmorphic floating overlays:

1. **`GisMap.tsx`**: Main canvas. Wraps Leaflet Map components (`MapContainer`, `TileLayer`, `Polygon`, `Marker`, `Popup`, `Polyline`, `Circle`). Integrates a modular switch to hot-swap to Google Maps Platform.
2. **`MapMarker.tsx`**: Generates Leaflet `divIcon` instances styled with custom CSS rings corresponding to issue priority (Critical, High, Medium, Low) and category emojis.
3. **`IssueSidebar.tsx`**: Left collapsible sidebar panel managing the complaints list. Clicking centers map viewport.
4. **`FilterDrawer.tsx`**: Slide-out form filter selector.
5. **`LayerPanel.tsx`**: Floating layer toggle box.
6. **`WardCard.tsx` / `RoutePlanner.tsx`**: Floating bottom panels displaying detailed insights for clicked wards or distance ETA routing parameters.
7. **`AnalyticsPanel.tsx`**: Viewport SLA summary metrics.
