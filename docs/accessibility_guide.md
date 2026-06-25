# Accessibility Guide — WCAG 2.2 AA Compliance

CivicMind AI is committed to offering a premium, inclusive experience accessible to all civic participants. This guide details our compliance checklist for WCAG 2.2 AA standards.

## 1. Keyboard Navigation & Focus Traps

- **Navigation**: All interactive elements (buttons, sidebar navigation, form inputs, GIS markers) must be focusable using the `Tab` key.
- **Outline Indicators**: Focus indicators should use clear styles (e.g. `focus-visible:ring-2 focus-visible:ring-indigo-500`) to guarantee high visual feedback.
- **Focus Traps**: Modals, alert popups, and the AI assistant chat panels must trap focus when active. Pressing `Escape` should close the dialog and restore focus to the triggering element.

---

## 2. Screen Readers & ARIA Labels

- **Descriptive Text**: Every graphic element or visual icon (Lucide icons, charts, SVG graphics) requires a corresponding `aria-label` or `title` tag describing its function.
- **Interactive States**: Elements modifying dynamically (loading spinners, alert updates) must use screen-reader announce tags (`aria-live="polite"` or `role="status"`).
- **Forms Validation**: All inputs should have associated `<label>` tags with matching `htmlFor` identifiers.

---

## 3. Contrast Ratios & Visual Assets

- **Text Contrast**: Text assets must support a minimum contrast ratio of 4.5:1 against light and dark background states to satisfy AA regulations.
- **Zoom Compatibility**: Page structures are optimized using fluid grid units (`rem`, `%`) to remain functional and wrap correctly up to 200% browser page zoom.
- **Reduced Motion**: Transition animations support standard media queries (`@media (prefers-reduced-motion: reduce)`) to disable transitions for users sensitive to motion.
