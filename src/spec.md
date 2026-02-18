# Specification

## Summary
**Goal:** Replace the old application logo with the newly uploaded logo and display it consistently across the header, dashboards, and login screen.

**Planned changes:**
- Generate/replace the static branding assets derived from `ee.png` and store them under `frontend/public/assets/generated` using the exact required filenames: `shq-kepsek-icon.dim_512x512.png` and `shq-kepsek-logo.dim_1024x256.png`.
- Centralize logo usage via `frontend/src/constants/branding.ts` and ensure `AppHeader`, `LoginPage`, `AdminDashboardPage`, and `KepsekDashboardPage` use the new branding constants (removing any legacy/hardcoded logo paths in those screens).
- Ensure the old logo is fully removed from the header, dashboards, and login page views, with assets served statically from `frontend/public/assets/generated`.

**User-visible outcome:** The new logo replaces the old one everywhere it appears in the app (header, admin dashboard, kepsek dashboard, and login page), with consistent branding across these screens.
