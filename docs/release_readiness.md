# Release Readiness Guide — CivicMind AI

This guide details the pre-deployment release checks required to promote CivicMind AI to a production hosting environment.

## 1. Secrets Management Audit

- **Environment Template**: Ensure the base configuration matches [.env.example](file:///c:/Users/Akshay/OneDrive/Desktop/New%20folder/CivicMind-AI/.env.example). No production API keys, passwords, or salts must ever be committed to the code repository.
- **Secrets Store**: In production, environment credentials must be loaded dynamically using Google Cloud Secret Manager (or a corresponding secure cloud vaults vault).
- **Placeholder Scans**: Perform a pre-commit TruffleHog scan to check for active keys.

---

## 2. API & Database Performance Readiness

- **DB Indexing**: Verify that user indexes are active on frequently queried fields (`User.email`, `Report.citizen_id`, `Report.assigned_officer_id`).
- **Caching Policies**: Caching parameters are handled by the custom in-memory caching layer (`app/core/cache.py`), with config placeholders for Redis production scaling.
- **Latency SLAs**: Ensure latency budgets remain below threshold rules:
  - Base CRUD Endpoint Latency: < 150 ms
  - AI Intent Dispatch & Reasoning: < 1200 ms
  - Map Rendering: < 350 ms

---

## 3. Deployment Steps Checklist

1. **Verify Automated Suites**: Confirm that `python -m pytest` passes with 100% success.
2. **Execute Static Build**: Confirm that `npm run build` compiles with 0 TypeScript/Vite output errors.
3. **Migrate DB Schemas**: Run migrations on the production SQLite target.
4. **Audit Roles & Permissions**: Confirm Admin Console roles are initialized.
5. **Verify AI Agent Configurations**: Confirm that all ADK agents load correctly and the Vertex/Gemini API is online.
