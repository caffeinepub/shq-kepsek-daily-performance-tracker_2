# Specification

## Summary
**Goal:** Enable date-scoped daily report and attendance flows (no “today-only” locks), ensure saved edits immediately persist and refresh across dashboards, and add admin report download by selected date.

**Planned changes:**
- Remove any UI/logic restrictions that limit principals to viewing/editing only today’s daily report; allow open/edit/save for any selected date.
- Persist edited daily reports to the backend keyed by the currently selected date, and refetch/reload the selected date’s report after save so the latest values display (including any photo reference).
- Update admin dashboard data refresh behavior so monitoring for the currently selected date reflects newly saved report changes without a full-page reload (e.g., query invalidation/refetch).
- Add an explicit, required date selection step in the principal attendance (absen) flow; disable/hide attendance inputs until a valid date is chosen, and save attendance under that date.
- Add an admin dashboard download control to export reports for the currently selected date, matching the data shown in the dashboard (including scores/notes and a photo presence/URL/identifier if applicable).

**User-visible outcome:** Principals can pick any date to view/edit/save that day’s report and must choose a date before taking attendance; admins see updated report data for a selected date automatically after saves and can download the reports for the currently selected date.
