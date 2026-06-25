# Architecture Guide

This document describes the structural and component architecture of the CivicMind AI platform.

## Architecture Diagram
```
              +------------------------------------------+
              |           React / Vite Client            |
              |   (Citizen, Gov, Admin Page Views)       |
              +--------------------+---------------------+
                                   | HTTP / JSON REST
                                   v
              +--------------------+---------------------+
              |           FastAPI Web Server             |
              |       (Router Triage, API Endpoints)     |
              +---------+-------------------+------------+
                        |                   |
                        v                   v
              +---------+---------+  +------+------------+
              |  Gemini AI Router |  |   SQLite Database |
              |  (PII Guardrails) |  |   (Local Storage) |
              +-------------------+  +-------------------+
```

## Component Breakdown

### 1. Frontend Workspace
- **Layout Panels (`src/layout`)**: Sets up structural containers (Navbar, Admin sidebar, Government drawer dashboards) that handle page boundaries, Dark Mode WCAG transitions, and the global Presentation Walkthrough banner overlays.
- **State contexts (`src/context`)**: Encapsulates isolated React context managers that decouple REST api service calls from page layout code.

### 2. FastAPI Backend Service
- **Authentication Route Handler (`app/api/auth.py`)**: Resolves JWT generation and validation, RBAC middleware checks, and secure password hashing.
- **AI Agent Controller (`app/api/qa.py` / `app/services`)**: Manages downstream query handoffs to specialized GIS, Health, and Welfare agents while running sanitization checks against PII and toxic prompt injections.

### 3. Isolated Testing Environment
- **Aiosqlite Fixture Isolation (`app/tests`)**: Spawns isolated test SQLite files on setup and tears them down on cleanup, avoiding race conditions and database locks during concurrent pytest executions.
