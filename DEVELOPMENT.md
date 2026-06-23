# CivicMind AI Development Guide

This guide details the structural architecture, component signatures, and development guidelines for the CivicMind AI platform.

---

## 📂 Detailed Folder Architecture

All modules must follow the established multi-layer directory structure:

1. **Frontend (`/src`)**:
   - `/components`: Houses atom-level design tokens (buttons, spinners, counters) and molecule cards. Keep components completely reusable.
   - `/layout`: Page wrappers (Navbar, Footer, AppLayout) managing responsive shells and sticky headers.
   - `/pages`: Modular pages loaded asynchronously via `React.lazy` to maintain minimal bundle sizes.
   - `/context`: Global state managers. Avoid placing business logic directly in layouts; leverage context providers instead.
   - `/hooks`: Viewport tracking (`useResponsive`), state controllers, and helper abstractions.
   - `/services`: Simulated network connection APIs. Wrappers use standard interfaces to support backend swap-outs.
   - `/constants`: Fixed configuration assets, navigation arrays, and branding tags.
   - `/styles`: Tailwind CSS imports and custom animation bindings.
   - `/types`: Hardened TypeScript interfaces for compilation safety.

2. **Backend (`/app`)**:
   - `/api`: FastAPI route handlers (to be populated in Module 2+).
   - `/models`: Database schema blueprints (PostgreSQL/SQLAlchemy).
   - `/schemas`: Request/Response validation layers (Pydantic).
   - `/services`: Business process managers.
   - `/core`: Application middleware, security protocols, and server configs.
   - `/database`: Connection pooling, transactions, and migration tools.

3. **AI & Cloud (`/agents`, `/cloud`)**:
   - `/agents` & `/workflows`: State configuration nodes (LangGraph) for complaint and scheme routing agents.
   - `/cloud`: Declarative orchestration assets for GCP Vertex AI, BigQuery, and Firebase Auth credentials.

---

## 🎨 Design System Components

### 1. `Button`
- **Location**: [Button.tsx](file:///c:/Users/OM%20TRIVEDI/Desktop/Google/src/components/Button.tsx)
- **Props**:
  - `variant`: `'primary' | 'secondary' | 'glass'`
  - `size`: `'sm' | 'md' | 'lg'`
  - `disabled`: `boolean`
  - `onClick`: `() => void`
- **Animations**: Hover scales to `1.02`, click/tap scales down to `0.98` using Framer Motion.

### 2. `GlassCard` & `GradientCard`
- **Locations**: [GlassCard.tsx](file:///c:/Users/OM%20TRIVEDI/Desktop/Google/src/components/GlassCard.tsx), [GradientCard.tsx](file:///c:/Users/OM%20TRIVEDI/Desktop/Google/src/components/GradientCard.tsx)
- **Design**: Configured with `backdrop-filter: blur(12px)` and transparent slate borders. Light mode automatically swaps background overlays.

### 3. `AnimatedCounter`
- **Location**: [AnimatedCounter.tsx](file:///c:/Users/OM%20TRIVEDI/Desktop/Google/src/components/AnimatedCounter.tsx)
- **Props**:
  - `value`: Target count number.
  - `duration`: Animation length in milliseconds (default `2000`).
- **Features**: Utilizes `requestAnimationFrame` and IntersectionObserver (`useInView`) to trigger counting only when the card scrolls into view.

### 4. `StatCard`
- **Location**: [StatCard.tsx](file:///c:/Users/OM%20TRIVEDI/Desktop/Google/src/components/StatCard.tsx)
- **Features**: Pairs an animated count, prefix/suffix values, vector icons, and short labels inside a glassy envelope.

### 5. `Timeline`
- **Location**: [Timeline.tsx](file:///c:/Users/OM%20TRIVEDI/Desktop/Google/src/components/Timeline.tsx)
- **Features**: Represents the 3-step citizen-to-government operational pipeline. Adapts from horizontal rows on desktop to vertical blocks on mobile screens.

### 6. `ComparisonTable`
- **Location**: [ComparisonTable.tsx](file:///c:/Users/OM%20TRIVEDI/Desktop/Google/src/components/ComparisonTable.tsx)
- **Features**: Compares Traditional Platforms vs CivicMind AI.

### 7. `SectionHeader`
- **Location**: [SectionHeader.tsx](file:///c:/Users/OM%20TRIVEDI/Desktop/Google/src/components/SectionHeader.tsx)
- **Features**: Sets typography sizing (`font-heading`) and applies entry translations to titles, descriptions, and pulsating category badges.

---

## 🛡️ Coding Standards & Type Safety

To maintain startup-quality enterprise standards, all modifications must adhere to:

1. **Strict TypeScript Typings**:
   - Avoid using `any` unless mapping third-party library conflicts (e.g., React 19 and Framer Motion prop mismatches).
   - Ensure all parameters, interfaces, and function return values are fully typed.

2. **SEO & Accessibility Checklist**:
   - Every input field must have an associated `<label>` or `aria-label`.
   - Focus rings must be visible on all keyboard navigations using `:focus-visible` or Tailwind's `focus-visible:` utility class.
   - Contrast check: Maintain WCAG 2.1 AA compliant color pairings between text and backgrounds in both light and dark modes.

3. **Performance Standards**:
   - Load all routing nodes via `React.lazy` wrapped in `<Suspense>`.
   - Keep assets lightweight; favor vector SVGs for icons and logos.
   - Memoize resource-intensive loop renders.

4. **Lint and Compiler Rules**:
   - Ensure `npm run build` is run and validated before committing code to ensure zero compilation or Oxlint errors.
