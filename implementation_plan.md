#  Attendance Tracker

A local-first personal attendance tracker designed  combining a bold Samsung Health-inspired visual language with accurate timetable versioning, session generation, and threshold forecasting for college students.

---

## User Review & Critical Decisions

- **Confirmed Decision — Relational Local Persistence**: Data is persisted in structured relational tables (`subject`, `schedule_slot`, `session`, `holiday`, `settings`) backed by browser `localStorage` with schema versioning (`schemaVersion: 1`), transactional JSON import/export, and CSV session export.

---

## 1. Overview & Core Concept

- **What It Does**: Tracks college class attendance per subject and across all subjects, automatically generating daily class sessions from weekly schedule slots, calculating exact "Can miss $N$" buffer or "Attend next $N$" recovery targets, and supporting historical backfilling, extra classes, and holidays.
- **Target Audience / Persona**: College students who need an instant, offline-reliable way to mark daily classes (`Present`, `Absent`, `Cancelled`) with one thumb and immediately see whether their attendance is safe, close to the cutoff, or below target.
- **Key Value**: Eliminates manual spreadsheet math and fragile timetable edits—changing a class schedule updates future sessions without corrupting historical attendance records, and marking a holiday dynamically excludes those sessions from attendance denominators without deleting them.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Daily Attendance Marking (Home Tab)**:
   - User views the **Hero Card** showing pooled attendance percentage (`78.4%`), status badge (`Safe` / `Close` / `Below`), progress bar, and summary line (`Target 75% · 2 subjects below target`).
   - User steps across dates using the `‹ Today ›` pill selector. Past dates allow backfilling; future dates display scheduled sessions in read-only mode.
   - Each scheduled or extra class renders as a **ClassCard** with subject color dot, title, time range (`09:00 – 10:00`), and three pill buttons (`Present`, `Absent`, `Cancelled`). Tapping an active status button again clears it back to unmarked, recalculating pooled and per-subject stats immediately.
   - Header actions allow marking/unmarking the current day as a **Holiday** (with undo banner) or opening the **Add Extra Class** modal (selecting subject, start time, and end time) or batch marking, which marks all classes as present for that day.

2. **Subject & Timetable Management (Subjects Tab)**:
   - Displays all active subjects with a colored initial badge, subject name and code, status-colored attendance percentage, and dynamic buffer caption (`Can miss 4`, `Attend next 4`, `Can miss 0`).
   - Tapping **+ Add subject** or any existing subject card opens the **Subject Editor Sheet/Modal** with:
     - Required name, optional course code, 8-color subject palette selector, optional start/end dates, optional target % override, and starting baseline counts (`attended so far` / `absent so far`).
     - **Schedule Editor**: List of weekly slots (weekday selector + start/end time pickers) with validation (`endTime > startTime`) and non-blocking **overlap warning** when two slots conflict on the same weekday.
     - **Non-Destructive Timetable Versioning**: Saving schedule edits closes modified old slots (`effectiveTo = yesterday`) and inserts new slots (`effectiveFrom = today`) so past sessions remain untouched.
     - **Recent History & Lifecycle Actions**: Displays recent sessions for that subject below the form, plus **Archive** (default safe removal from active counts) and **Delete** (with confirmation dialog).

3. **Calendar & Breakdown Inspection (Stats Tab)**:
   - **Week | Month Segmented Control**:
     - **Month View**: 7-column Monday-first calendar grid (Sunday header and numbers in red) with month navigation arrows. Each day displays a status dot (`green` = all present, `red` = any absent, `amber` = mixed, none = no held classes). Tapping any day opens an interactive **Day Sessions Bottom Sheet** to inspect or edit that day's sessions.
     - **Week View**: Single 7-day week strip at top with expandable per-day session rows listed directly underneath.
   - **By Subject Card**: Horizontal progress bars colored by each subject's palette swatch, sorted lowest percentage first.

4. **Preferences, Holidays, Reminders & Backup (Settings Modal Sheet)**:
   - Accessible from the circular top-right button on all three tabs.
   - Theme switcher (`System` / `Light` / `Dark`), global target percentage slider/input (default `75%`), daily reminder toggle and time picker (default `18:00` on active weekdays with browser Notification API support), **Manage Holidays** list, **Export Data** (JSON backup + Sessions CSV), **Import Data** (validates schema version and replaces all records after confirmation), and demo data reset controls.

### Visual Identity & Theme (Android Specification)

- **Aesthetic Direction**: Samsung Health-inspired Android Material utility—generous `28px` rounded cards, crisp `1px` structural borders, bold tabular numerals, zero glass/blur effects, and high-contrast semantic status fills.
- **Color Tokens**:
  - **Light Theme**: Background `#F3F3F5`, Card Surface `#FBFBFD`, Primary Text `#111114`, Subtext `#6E6E78`, Line Border `#E3E3E8`.
  - **Dark Theme**: Background `#0C1E3A` (deep navy canvas matching the Android Stats reference screen), Card Surface `#1B1C21`, Primary Text `#F5F5F7`, Subtext `#A4A4B0`, Line Border `#2C2D34`.
  - **Semantic Status & Action Tokens**:
    - Safe / Present / Hero Card Fill: `#0D8A33` (Light) / `#3DDC84` (Dark)
    - Close to Target (`target <= pct < target + 5%`): `#B26A00` (Light) / `#FFB020` (Dark)
    - Below Target (`pct < target`): `#D1323A` (Light) / `#FF6B72` (Dark)
    - Absent Selected Button: `#D6336C`
    - Cancelled Selected Button: `#5F6B80`
    - Primary CTA Button (`+ Add subject`): `#00BF63` with `#06210F` dark ink
  - **8-Color Subject Palette**: `#1FB45A`, `#1E9BFF`, `#A25CF2`, `#F2459B`, `#FF8A1F`, `#FFC21A`, `#14B8A6`, `#6C7BFF`.
- **Typography & Scale**:
  - Font family: **Figtree** (`400`, `500`, `600`, `700`, `800`) with `tabular-nums` on all percentages, dates, and counters.
  - Scale: Display Hero `52px / 800`, Screen Header H1 `28px / 800`, Card Title `17px / 700`, Body `15px / 500`, Caption `12–13px / 600`.
- **Geometry & Ergonomics**:
  - Card radius `28px`, inner elements `16px`, buttons and floating bottom navigation `999px` (pill).
  - Floating bottom pill navigation bar: `64px` height, `22px` horizontal margins, solid card surface with `1px` line border, and `52px` inner active pill indicator. All touch targets $\ge 44\text{px}$.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Pure String Local Dates (`YYYY-MM-DD`) and Times (`HH:mm`)**
  - *Chosen Approach*: All date and time comparisons, calendar grid generation, and session keys operate strictly on local ISO date strings (`YYYY-MM-DD`) and 24-hour time strings (`HH:mm`) rather than UTC epoch timestamps.
  - *Why*: Eliminates timezone drift and Daylight Saving Time off-by-one-day bugs when checking weekday schedules or exporting/importing backups across devices.
- **Decision 2: Non-Destructive Holiday Exclusion & Timetable Versioning**
  - *Chosen Approach*: Session generation still creates scheduled rows on holidays, and marking a day as a holiday simply records the date in the `holiday` table. Attendance counting filters out sessions whose date appears in `holiday`. Similarly, editing a timetable slot closes the previous slot (`effectiveTo = yesterday`) and opens a new slot (`effectiveFrom = today`).
  - *Why*: Unmarking a holiday immediately restores that day's sessions and attendance counts without data loss, and changing a semester schedule mid-term never rewrites past weeks.
- **Decision 3: Decoupled Pure Domain Engine with Automated Unit Tests**
  - *Chosen Approach*: All attendance math (`canMiss`, `mustAttend`, pooled percentage, status tiering, slot overlap detection, and idempotent session generation) lives in pure TypeScript functions verified by unit tests (`node:test`) before UI integration.
  - *Why*: Guarantees edge cases (such as `100%` target percentage, `0` held classes, cancelled classes ignored in denominators, and historical slot boundaries) are 100% accurate.

---


### Data Model & Relational Entities

- **`subject`**: `id`, `name`, `code`, `color`, `startDate`, `endDate`, `targetPct` (`null` uses global default), `baselinePresent`, `baselineAbsent`, `archivedAt`, `createdAt`.
- **`schedule_slot`**: `id`, `subjectId`, `weekday` (`0`=Sun..`6`=Sat), `startTime`, `endTime`, `effectiveFrom`, `effectiveTo`.
- **`session`**: `id`, `subjectId`, `slotId` (`null` for extra classes), `date`, `startTime`, `endTime`, `status` (`'present' | 'absent' | 'cancelled' | null`), `markedAt` — enforced with a unique composite key on `(slotId, date)` when `slotId` is non-null.
- **`holiday`**: `date` (primary key), `label`.
- **`settings`**: `id = 1`, `globalTargetPct` (`75`), `theme` (`'system' | 'light' | 'dark'`), `reminderEnabled`, `reminderTime` (`'18:00'`), `schemaVersion` (`1`), `lastGeneratedDate`, `hasOnboarded` (`true` stub flag).

### Interactive Component & State Mapping

- **Session Marking (`ClassCard` & `DaySessionsSheet`)**: Clicking `Present`, `Absent`, or `Cancelled` toggles the session status (`status === clicked ? null : clicked`), sets `markedAt`, persists to `session`, and triggers immediate recalculation of the Home Hero Card, Subjects list captions, Calendar day dot color, and By-Subject progress bars.
- **Date Navigation (`DatePill` on Home)**: Stepping left/right updates `selectedDate`. If `selectedDate > today`, scheduled sessions are previewed from active `schedule_slot` rules with marking buttons disabled and labeled as future preview.
- **Subject & Slot Saving (`SubjectModal`)**: Validates non-empty subject name and `startTime < endTime` for all slots; computes weekday time overlaps across all non-archived subjects to display a non-blocking warning banner; versions changed slots (`effectiveTo = yesterday`) and generates today's sessions idempotently.
- **Backup & Restore (`SettingsModal`)**: Exporting generates a schema-versioned JSON payload (`{ version: 1, exportedAt, subjects, slots, sessions, holidays, settings }`) and optional CSV session log; importing validates structure and replaces all tables atomically after user confirmation without regenerating historical dates.
