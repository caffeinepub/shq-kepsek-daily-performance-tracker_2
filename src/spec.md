# Specification

## Summary
**Goal:** Fix the Admin Monitoring table so daily progress indicators reliably display for every report row on any selected date.

**Planned changes:**
- Update the Admin Monitoring table to always render the five daily progress category indicators (Attendance, Class Control, Teacher Control, Parent/Guardian Response, Program & Problem Solving) for each returned report row and selected date.
- Fix `DailyProgressIndicators` completion detection to use robust checks against actual DailyReport fields (including correct handling of optional/opt Candid fields) rather than fragile equality checks like `score === 20`.
- Ensure any user-facing text touched during the fix (including empty states) is in English.

**User-visible outcome:** In Admin Monitoring, selecting any date that has reports will show non-blank daily progress indicators for each report row, with completion status accurately reflecting the stored report data.
