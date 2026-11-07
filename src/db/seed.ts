import { expoDb } from './client';
import { generateUUID } from '../domain/attendance';

export function seedDemoData(targetDateStr: string = '2026-11-07') {
  // Clear any existing data
  expoDb.execSync(`
    DELETE FROM sessions;
    DELETE FROM schedule_slots;
    DELETE FROM subjects;
    DELETE FROM holidays;
  `);

  const physicsId = 'sub-physics';
  const dsId = 'sub-data-structures';
  const econId = 'sub-economics';
  const chemId = 'sub-chemistry';

  // 1. Insert 4 Subjects matching screenshots
  expoDb.runSync(
    `INSERT INTO subjects (id, name, code, color, target_pct, baseline_present, baseline_absent, start_date, end_date, archived_at, created_at)
     VALUES 
      (?, 'Physics', 'PHY101', '#1E9BFF', 75, 36, 8, '2026-08-01', NULL, NULL, '2026-08-01T00:00:00Z'),
      (?, 'Data Structures', 'CS201', '#A25CF2', 75, 17, 7, '2026-08-01', NULL, NULL, '2026-08-01T00:00:00Z'),
      (?, 'Economics', 'ECO110', '#FF8A1F', 75, 19, 6, '2026-08-01', NULL, NULL, '2026-08-01T00:00:00Z'),
      (?, 'Chemistry', 'CHE102', '#1FB45A', 75, 27, 3, '2026-08-01', NULL, NULL, '2026-08-01T00:00:00Z')`,
    [physicsId, dsId, econId, chemId]
  );

  // 2. Schedule slots: Weekdays (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
  // Target date 2026-11-07 is a Saturday (weekday 6)
  const slotPhysicsSat = 'slot-phy-sat';
  const slotDsSat = 'slot-ds-sat';
  const slotEconSat = 'slot-econ-sat';

  expoDb.runSync(
    `INSERT INTO schedule_slots (id, subject_id, weekday, start_time, end_time, effective_from, effective_to)
     VALUES
      -- Physics: Mon, Wed, Fri, Sat
      ('slot-phy-mon', ?, 1, '09:00', '10:00', '2026-08-01', NULL),
      ('slot-phy-wed', ?, 3, '09:00', '10:00', '2026-08-01', NULL),
      ('slot-phy-fri', ?, 5, '09:00', '10:00', '2026-08-01', NULL),
      (?, ?, 6, '09:00', '10:00', '2026-08-01', NULL),

      -- Data Structures: Tue, Thu, Sat
      ('slot-ds-tue', ?, 2, '11:00', '12:00', '2026-08-01', NULL),
      ('slot-ds-thu', ?, 4, '11:00', '12:00', '2026-08-01', NULL),
      (?, ?, 6, '11:00', '12:00', '2026-08-01', NULL),

      -- Economics: Mon, Wed, Sat
      ('slot-econ-mon', ?, 1, '14:00', '15:00', '2026-08-01', NULL),
      ('slot-econ-wed', ?, 3, '14:00', '15:00', '2026-08-01', NULL),
      (?, ?, 6, '14:00', '15:00', '2026-08-01', NULL),

      -- Chemistry: Tue, Thu
      ('slot-chem-tue', ?, 2, '09:00', '10:30', '2026-08-01', NULL),
      ('slot-chem-thu', ?, 4, '09:00', '10:30', '2026-08-01', NULL)`,
    [
      physicsId, physicsId, physicsId, slotPhysicsSat, physicsId,
      dsId, dsId, slotDsSat, dsId,
      econId, econId, slotEconSat, econId,
      chemId, chemId
    ]
  );

  // 3. Today's sessions (matching screenshot 4):
  // Physics 09:00 - 10:00 -> 'present'
  // Data Structures 11:00 - 12:00 -> null ('Tap to mark')
  // Economics 14:00 - 15:00 -> 'cancelled'
  expoDb.runSync(
    `INSERT INTO sessions (id, subject_id, slot_id, date, start_time, end_time, status, marked_at)
     VALUES
      (?, ?, ?, ?, '09:00', '10:00', 'present', '2026-11-07T09:05:00Z'),
      (?, ?, ?, ?, '11:00', '12:00', NULL, NULL),
      (?, ?, ?, ?, '14:00', '15:00', 'cancelled', '2026-11-07T13:30:00Z')`,
    [
      generateUUID(), physicsId, slotPhysicsSat, targetDateStr,
      generateUUID(), dsId, slotDsSat, targetDateStr,
      generateUUID(), econId, slotEconSat, targetDateStr
    ]
  );

  // 4. Sample past sessions in November 2026 for the calendar dot indicators
  // Nov 2 (Mon) -> all present
  // Nov 3 (Tue) -> all present
  // Nov 4 (Wed) -> mixed/absent
  // Nov 5 (Thu) -> all present
  // Nov 6 (Fri) -> all present
  expoDb.runSync(
    `INSERT INTO sessions (id, subject_id, slot_id, date, start_time, end_time, status, marked_at)
     VALUES
      (?, ?, 'slot-phy-mon', '2026-11-02', '09:00', '10:00', 'present', '2026-11-02T10:00:00Z'),
      (?, ?, 'slot-econ-mon', '2026-11-02', '14:00', '15:00', 'present', '2026-11-02T15:00:00Z'),
      (?, ?, 'slot-chem-tue', '2026-11-03', '09:00', '10:30', 'present', '2026-11-03T10:30:00Z'),
      (?, ?, 'slot-ds-tue', '2026-11-03', '11:00', '12:00', 'present', '2026-11-03T12:00:00Z'),
      (?, ?, 'slot-phy-wed', '2026-11-04', '09:00', '10:00', 'absent', '2026-11-04T10:00:00Z'),
      (?, ?, 'slot-econ-wed', '2026-11-04', '14:00', '15:00', 'present', '2026-11-04T15:00:00Z'),
      (?, ?, 'slot-chem-thu', '2026-11-05', '09:00', '10:30', 'present', '2026-11-05T10:30:00Z'),
      (?, ?, 'slot-ds-thu', '2026-11-05', '11:00', '12:00', 'present', '2026-11-05T12:00:00Z'),
      (?, ?, 'slot-phy-fri', '2026-11-06', '09:00', '10:00', 'present', '2026-11-06T10:00:00Z')`,
    [
      generateUUID(), physicsId,
      generateUUID(), econId,
      generateUUID(), chemId,
      generateUUID(), dsId,
      generateUUID(), physicsId,
      generateUUID(), econId,
      generateUUID(), chemId,
      generateUUID(), dsId,
      generateUUID(), physicsId
    ]
  );

  // 5. Update settings flag
  expoDb.runSync(`UPDATE settings SET has_seeded_demo = 1 WHERE id = 1`);
}
