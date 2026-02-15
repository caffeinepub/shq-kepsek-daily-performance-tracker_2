# Specification

## Summary
**Goal:** Let admins view a list of all active schools in the admin area.

**Planned changes:**
- Add an admin-only backend query that returns schools filtered to `active=true`, including school name, region, principal name, active flag, and the associated Principal (Kepsek) ID.
- Add a React Query hook to fetch and cache the active schools list with loading/error states, returning an empty list when no data is available yet.
- Update the Admin UI to include an “Active Schools” section with a searchable table/list (School Name, Region, Principal Name, Principal ID), result count, loading state, and empty state (English text).

**User-visible outcome:** Admin users can see an “Active Schools” section in the admin area showing a searchable list/table of all active schools with key details and a count of matching results.
