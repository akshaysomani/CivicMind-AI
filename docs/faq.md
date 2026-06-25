# Frequently Asked Questions (FAQ)

## 1. What is CivicMind AI?
CivicMind AI is an enterprise-grade platform that automates municipal coordination, triage, and analytics. It allows citizens to geolocate and report concerns, which are triaged by AI agents and routed to relevant government dispatchers or local NGOs.

## 2. How does the Multi-Agent AI Orchestrator work?
The backend uses a Gemini-powered semantic router that reads incoming prompts and routes them to specialized subprocessors (e.g. GIS, Schemes, Health) depending on the core request context, ensuring that answers are grounded, relevant, and secure.

## 3. How do I run the automated test suite?
Ensure that you have installed the Python test dependencies (`pytest`, `pytest-asyncio`, `pytest-cov`, `httpx`). Run:
```bash
python -m pytest
```
This isolates each module test by deploying separate SQLite databases that are initialized and teardown during test scope hooks.

## 4. How can I demo the project for a hackathon?
Navigate to the frontend page, click the **"✨ Guided Tour"** button in the header. The system will guide you step-by-step through the citizen map, the AI orchestrator, the government dispatch screen, and the QA monitoring views while auto-authenticating simulated profiles.
