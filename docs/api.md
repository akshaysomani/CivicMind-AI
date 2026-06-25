# API Endpoints Documentation

This document describes the key REST API routes exposed by the CivicMind AI backend web server.

---

## 1. Authentication

### POST `/api/v1/auth/register`
Creates a new citizen or government user.
- **Request Body:**
  ```json
  {
    "email": "citizen@civicmind.demo",
    "password": "strong-password-123",
    "first_name": "Demo",
    "last_name": "Citizen",
    "city": "San Francisco",
    "state": "California"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "user_id": 1
  }
  ```

### POST `/api/v1/auth/login`
Authenticates a user and issues a JWT token.
- **Request Body:**
  ```json
  {
    "username": "citizen@civicmind.demo",
    "password": "strong-password-123"
  }
  ```
- **Response:**
  ```json
  {
    "access_token": "jwt-token-string",
    "token_type": "bearer"
  }
  ```

---

## 2. Issues & GIS Coordinates

### GET `/api/v1/issues`
Fetches unresolved/triaged municipal issues. Enforces RBAC checks (NGO / Government users get full list, Citizens get their own submitted reports).

### POST `/api/v1/issues/create`
Submits a geolocated municipal concern.
- **Request Parameters:**
  - Header: `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "title": "Broken Water Pipe",
    "description": "Severe utility leak on main road.",
    "category": "Utilities",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "ward": "Ward 4"
  }
  ```

---

## 3. QA, Diagnostics & Operations

### GET `/api/v1/qa/status`
Returns real-time execution parameters for all 108 tests. Restricted to users with the Admin / Super Administrator role.
