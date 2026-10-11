/* ---- Team of Grace config ----
   SHEET_ID = LP Sarah's Google Form response sheet (shared "anyone with the link"). The loader reads the
   form layout directly: Timestamp | LEADERS | Prayer Day | Attendance | Names | Offering | Picture |
   Outreach days | Attendance | Number of souls | Offering | Pictures | Rehearsal Day | Venue | Attendance | Offering | Pictures
   (+ any later column whose header contains "church" is read as Sunday in church).
   Each submission counts for the week ending the Sunday on/after its timestamp; a later submission by the same leader
   in the same week overrides the earlier one. manual.js adds anything typed by hand (e.g. leaders who did not use the form). */
window.TG_CONFIG = { SHEET_ID: '1zJSblm8FytvztPCumxG3w2_g96fRB8a9e8M0mdMRyOQ', TAB: '', TEAM_SIZE: 20 };
