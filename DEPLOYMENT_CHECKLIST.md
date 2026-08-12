# Deployment Checklist: FlyRank Capstone

## 1. Resilience & Stability
- [x] **API Key Handled Gracefully**: Missing API key returns a friendly 400 error and displays a clear message to the user instead of breaking the app.
- [x] **Robust Storage**: `localStorage` uses `try/catch` wrappers. If quota is exceeded, an error is caught gracefully.
- [x] **Error Boundaries**: A global `error.tsx` boundary catches unexpected React rendering errors and provides a recovery UI.
- [x] **Rate Limiting**: An in-memory rate limiter prevents abuse of the API routes (max 10 requests per minute).

## 2. Accessibility
- [x] All new form inputs have associated `<Label>` elements or `sr-only` labels (e.g. estimated price inputs).
- [x] Form fields support keyboard navigation.
- [x] High contrast UI tokens preserved from the existing design system.

## 3. Product Upgrades
- [x] **Budget Integration**: Added "Hourly" and "Fixed Total" budget types. Fixed budgets support per-item pricing and display a running total. AI change analysis now includes budget impact calculation.
- [x] **Formal Signatures & Agency Profiles**: Agencies can upload a stamp. The signature flow allows typed names, locking the agreement and generating a formal record.
- [x] **PDF Generation**: Added `@react-pdf/renderer` to generate a downloadable, professionally formatted PDF of the locked agreement.

## 4. Testing
- [x] **Unit Testing**: Configured `vitest` and wrote tests for `scope-state.ts` (validating state transitions and signature locks).
- [x] **E2E Testing**: Configured Playwright and wrote an E2E test validating the scope extraction UI flow and missing API key error state.
