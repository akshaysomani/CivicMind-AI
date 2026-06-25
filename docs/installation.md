# Installation & Configuration Guide

Follow these steps to configure and run the CivicMind AI workspace locally.

## Prerequisites
- **Node.js:** v20+
- **Python:** v3.10+
- **NPM / Pip**

---

## 1. Environment Configurations
Clone or copy the template `.env.example` in the root directory to a new file named `.env`:
```bash
# Example Local Setup
DATABASE_URL="sqlite+aiosqlite:///./civicmind.db"
SECRET_KEY="super-secret-development-key-change-in-production"
GEMINI_API_KEY="your-gemini-developer-key"
```

---

## 2. Frontend Installation & Build
1. Navigate to the root directory.
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Run the development server locally:
   ```bash
   npm run dev
   ```
4. Build static production assets:
   ```bash
   npm run build
   ```

---

## 3. Backend Setup
1. Create a virtual environment and install backend requirements:
   ```bash
   python -m venv venv
   source venv/bin/activate # On Windows: venv\Scripts\activate
   pip install -r app/requirements.txt
   ```
2. Initialize database schemas:
   ```bash
   python app/core/init_db.py
   ```
3. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
