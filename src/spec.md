# Specification

## Summary
**Goal:** Let a central admin edit any school entry from the Admin “Active Schools” list, even when the admin is not the school’s owning principal.

**Planned changes:**
- Add an admin-only backend API to update a School record under an arbitrary provided Principal key (not the caller).
- Add an Edit action per row in the Admin “Active Schools” table that opens a prefilled modal/form to edit School Name, Region, Principal Name, and Active status.
- Extend the React Query data layer with an admin update-school mutation by principal ID, and invalidate/refetch the active schools list and active schools count on success.

**User-visible outcome:** A central admin can click Edit on a school in the Active Schools table, update its details (including toggling Active off), save changes, and see the list refresh—removing the school if it was set inactive; non-admin users see a clear permission error if they attempt the save.
