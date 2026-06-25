# Developer Coding Guidelines

Welcome to the developer guide for CivicMind AI. Please adhere to these guidelines to ensure consistency, type-safety, and maintainability across the repository.

---

## 1. Frontend Development

### Strict TypeScript Typings
- Avoid using `any`. Define interface files inside `src/types/` for all custom structures (e.g. `Issue`, `User`, `KPI`).
- Type-check code before staging commits by running:
  ```bash
  npm run build
  ```

### Design System and Spacing
- Use tailwind utilities mapped in `src/styles/index.css`.
- Ensure components utilize the glassmorphic dark-mode aesthetics:
  - Background panels: `bg-slate-900/30 backdrop-blur-md`
  - Border overlays: `border border-white/10`
- Maintain WCAG AA standard color contrasts (`text-slate-400`, `text-slate-300`, and vivid accents with low opacity backgrounds).

---

## 2. Backend Development

### FastAPI Best Practices
- Enforce strict typing on Pydantic schemas.
- Place auth validation middleware dependencies (`get_current_user`, `get_admin_user`) directly inside the endpoints routing stack.

### Writing and Running Tests
- When adding backend features, write matching unit tests inside `app/tests/`.
- Maintain test isolation. Refer to the [Testing Guide](testing_guide.md) to initialize separate database URLs for your test modules.
