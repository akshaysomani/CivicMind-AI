# Product Roadmap

This document outlines the planned future milestones and scale roadmap for the CivicMind AI platform.

## Phase 1: Local Prototype & Hackathon Polish (Current)
- [x] Baseline database schema and API auth flow.
- [x] Leaflet GIS and analytics integrations.
- [x] Multi-agent Gemini orchestrator and PII safety guardrails.
- [x] WCAG AA dark/light mode optimization.
- [x] Hackathon guided walkthrough presentation mode.

## Phase 2: Production Scale & Cloud Transition
- [ ] **PostgreSQL Migration:** Move database layer to managed Google Cloud SQL (PostgreSQL) supporting pgvector.
- [ ] **Google Cloud Run Deployment:** Build multi-stage Dockerfiles and deploy frontend + backend components behind Cloud Load Balancer.
- [ ] **Real-time GIS Clustering:** Implement Leaflet markers clustering configurations to visualize large volumes of spatial points efficiently.
- [ ] **Vertex AI Integration:** Transition from standard Gemini developer keys to managed Vertex AI IAM credentials.

## Phase 3: Advanced AI Workflows
- [ ] **LangGraph Orchestration:** Migrate localized agent routing handlers to full LangGraph state machines for multi-step agent negotiations.
- [ ] **Predictive Alerts:** Enable auto-dispatch of municipal briefs to NGOs based on seasonal ARIMA forecast threshold breaches.
