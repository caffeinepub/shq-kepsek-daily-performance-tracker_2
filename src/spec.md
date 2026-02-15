# Specification

## Summary
**Goal:** Reduce onboarding friction for school principals by auto-assigning the Kepsek/user role during school profile registration and improving the “Access Denied” experience for users with no role.

**Planned changes:**
- Backend: Update the existing admin school-registration/update flow so that when a principal is registered/updated, they are automatically granted the Kepsek/user role (within the single main actor canister).
- Frontend: Enhance the Access Denied screen for guest/no-role users to display the logged-in Principal ID (read-only) with a one-click Copy action (with success toast), provide clear English next-step instructions, and add a Retry action that refetches the caller role and routes to the correct dashboard if access is granted.
- Frontend: Update the Admin “Manage School Principals” page and Kepsek registration form to use English labels/instructions and to reflect that saving a school profile automatically assigns Kepsek access (remove any suggestion of a separate manual role assignment step).

**User-visible outcome:** Principals registered by an admin can log in and reach the Kepsek dashboard without seeing Access Denied; if a user has no role, they can copy their Principal ID, follow clear instructions, and retry access without signing out.
