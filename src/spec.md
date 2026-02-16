# Specification

## Summary
**Goal:** Fix the principal (Kepsek) daily report save/update behavior so edits persist per selected calendar day and immediately reflect in both Kepsek and admin/management dashboards.

**Planned changes:**
- Fix Kepsek daily report save/update so edited values persist and re-render correctly for the selected date (attendance arrival/departure times + attendance photo, class control, teacher control, wali santri response, and program/problem solving).
- Ensure reports are stored, loaded, and overwritten strictly per calendar day: load the selected day’s report, save overwrites that same day’s report, and days without a saved report show an empty form (no prefill from previous day).
- After saving a Kepsek report, invalidate/refetch relevant admin/management monitoring queries so admin dashboards for that same date show the updated report content.

**User-visible outcome:** Kepsek can edit and save a daily report for a specific date and immediately see the updated values for that date (even after refresh), and admin/management dashboards reflect the updated report for that same day after the normal refresh/fetch cycle.
