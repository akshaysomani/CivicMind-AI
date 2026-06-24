

> **AI-Powered Community Decision Intelligence Platform**

CivicMind AI is an enterprise-grade SaaS platform designed to bridge the coordination gap between citizens, NGOs, and municipal governments. By utilizing decentralized GIS mappings, predictive analytics, and Google Gemini-powered multi-agent state machines, CivicMind AI converts community feedback into actionable resolution pipelines.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19 (Vite + TypeScript)
- **Styling**: Tailwind CSS v4 (Modern CSS-first configuration, backdrop filters, and custom theme parameters)
- **Animations**: Framer Motion (hover, tap, and entry micro-animations)
- **Icons**: Lucide React
- **Routing**: React Router DOM (v7) with Lazy Loading & Code-Splitting
- **Visuals**: Recharts (analytics) & Leaflet (geospatial mapping)

### Backend (Future Modules)
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (Structured data & pgvector storage)
- **Cache**: Redis

### AI & Cloud (Future Modules)
- **LLM Coordination**: Google Gemini (via Vertex AI)
- **Workflows**: LangGraph (Decentralized state machine agents)
- **Cloud Infrastructure**: Firebase Auth, Google Cloud Storage, BigQuery

---

## 📂 Project Architecture

```
CivicMind AI
├── .env.example              # Template for server, database, and API keys
├── index.html                # Main index.html containing SEO metadata
├── package.json              # Frontend dependency configurations
├── vite.config.ts            # Vite compiler and Tailwind v4 integrations
├── tsconfig.json             # TypeScript root settings
│
├── /src                      # FRONTEND SOURCE
│   ├── /components           # Reusable Design System components
│   ├── /layout               # Sticky Navbar, Layout grids, and Footers
│   ├── /pages                # Lazy-loaded page routes (Landing, About, Features, Contact, 404)
│   ├── /context              # Global React State contexts (Theme, App, Notifications, AI)
│   ├── /hooks                # Custom React Hooks (useTheme, useResponsive, useNotifications)
│   ├── /services             # Simulated API Client requests
│   ├── /constants            # App labels, stats, and theme configs
│   ├── /styles               # Tailwind globals, animations, and typography
│   └── /types                # Strict TypeScript interface typings
│
├── /app                      # BACKEND (FastAPI - Folders Initialized)
│   ├── /api                  # API routes & endpoint definitions
│   ├── /models               # DB Schema models (PostgreSQL)
│   ├── /schemas              # Pydantic schemas
│   ├── /services             # Core business logic handlers
│   ├── /core                 # Security headers, logging, and configurations
│   ├── /database             # Database connectors & session pools
│   ├── /utils                # Helper scripts
│   ├── /config               # Config settings
│   └── /tests                # Pytest suits
│
├── AI Layer (Folders Initialized)
│   ├── /agents               # Gemini Agent definitions
│   ├── /prompts              # System prompts
│   ├── /rag                  # Retrieval-Augmented Generation configurations
│   ├── /vector               # Vector DB connections (pgvector)
│   └── /workflows            # LangGraph multi-agent coordination
│
└── /cloud                    # CLOUD LAYOUT (Folders Initialized)
    ├── /firebase             # Firebase Authentication functions
    ├── /gcp                  # Vertex AI & BigQuery pipelines
    ├── /storage              # Cloud Storage bucket scripts
    └── /docs                 # Cloud deployment guides
```

---

## 🛠️ Quickstart

### Prerequisites
- **Node.js**: v20+ (Tested on v25.2)
- **NPM**: v10+ (Tested on v11.6)

### Installation
1. Clone or navigate to the workspace directory.
2. Install frontend dependencies:
   ```bash
   npm install
   ```

### Running Locally
To launch the Vite development server in dark/light mode:
```bash
npm run dev
```

### Production Compilation
Verify that all TypeScript type-safety rules and compiler directives build successfully:
```bash
npm run build
```

---

## 📖 Extended Documentation
For comprehensive guides on the project architecture, design systems, and security components:
- [Development Guide](file:///c:/Users/OM%20TRIVEDI/Desktop/Google/DEVELOPMENT.md)
- [Authentication & User Management Architecture](file:///c:/Users/OM%20TRIVEDI/Desktop/Google/docs/auth_architecture.md)

