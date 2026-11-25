import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWidgetSnapshot, syncWidgetSnapshot } from '../../utils/widgets.ts';
import type { Subject, Session, Holiday, Settings } from '../../types/index.ts';

function getLocalTodayStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const baseSettings: Settings = {
  id: 1,
  globalTargetPct: 75,
  theme: 'dark',
  primaryCardLabel: 'code',
  dailyReminderEnabled: false,
  dailyReminderTime: '18:00',
  perClassReminderEnabled: false,
  perClassReminderOffsetMinutes: 5,
  sundayDigestEnabled: false,
  hapticFeedbackEnabled: true,
  hasSeededDemo: true,
  hasOnboarded: true,
  lastBackupAt: null,
};

test('buildWidgetSnapshot populates all active subjects with accurate tiers even without today sessions', () => {
  const todayStr = getLocalTodayStr();

  const subjects: Subject[] = [
    {
      id: 'sub-phy',
      name: 'Physics',
      code: 'PHY101',
      color: '#1E9BFF',
      targetPct: 75,
      baselinePresent: 37,
      baselineAbsent: 8,
      startDate: '2026-09-01',
      endDate: null,
      archivedAt: null,
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'sub-eco',
      name: 'Economics',
      code: 'ECO110',
      color: '#FFB020',
      targetPct: null, // inherits 75
      baselinePresent: 19,
      baselineAbsent: 6,
      startDate: '2026-09-01',
      endDate: null,
      archivedAt: null,
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'sub-cs',
      name: 'Data Structures',
      code: 'CS201',
      color: '#3DDC84',
      targetPct: 75,
      baselinePresent: 17,
      baselineAbsent: 7,
      startDate: '2026-09-01',
      endDate: null,
      archivedAt: null,
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'sub-math',
      name: 'Linear Algebra',
      code: 'MATH301',
      color: '#A855F7',
      targetPct: 75,
      baselinePresent: 0,
      baselineAbsent: 0,
      startDate: '2026-09-01',
      endDate: null,
      archivedAt: null,
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'sub-archived',
      name: 'Archived Subject',
      code: 'OLD101',
      color: '#5F6B80',
      targetPct: 75,
      baselinePresent: 10,
      baselineAbsent: 0,
      startDate: '2026-09-01',
      endDate: null,
      archivedAt: '2026-10-01T00:00:00Z',
      createdAt: '2026-09-01T00:00:00Z',
    },
  ];

  // Only PHY101 has a session today; ECO110, CS201, MATH301 still must appear in snapshot.subjects
  const sessions: Session[] = [
    {
      id: 'ses-1',
      subjectId: 'sub-phy',
      slotId: 'slot-1',
      date: todayStr,
      startTime: '09:00',
      endTime: '10:00',
      status: null,
      markedAt: null,
    },
  ];

  const snapshot = buildWidgetSnapshot(subjects, sessions, [], baseSettings, true);

  assert.equal(snapshot.sessions.length, 1);
  assert.equal(snapshot.subjects.length, 4);

  const phy = snapshot.subjects.find((s) => s.subjectId === 'sub-phy')!;
  assert.equal(phy.percentage, 82.2);
  assert.equal(phy.tier, 'safe');
  assert.equal(phy.statusLabel, 'Can miss 4');
  assert.equal(phy.attended, 37);
  assert.equal(phy.totalHeld, 45);

  const eco = snapshot.subjects.find((s) => s.subjectId === 'sub-eco')!;
  assert.equal(eco.percentage, 76);
  assert.equal(eco.tier, 'warning');
  assert.equal(eco.statusLabel, 'Can miss 0');

  const cs = snapshot.subjects.find((s) => s.subjectId === 'sub-cs')!;
  assert.equal(cs.percentage, 70.8);
  assert.equal(cs.tier, 'danger');
  assert.equal(cs.statusLabel, 'Attend next 4');

  const math = snapshot.subjects.find((s) => s.subjectId === 'sub-math')!;
  assert.equal(math.totalHeld, 0);
  assert.equal(math.tier, 'neutral');
  assert.equal(math.statusLabel, 'No classes yet');
});

test('syncWidgetSnapshot recognizes holiday state and falls back safely without native module', () => {
  const todayStr = getLocalTodayStr();
  const holidays: Holiday[] = [{ date: todayStr, label: 'National Holiday' }];

  const snapshot = buildWidgetSnapshot([], [], holidays, baseSettings, false);
  assert.equal(snapshot.isHoliday, true);
  assert.equal(snapshot.holidayLabel, 'National Holiday');
  assert.equal(snapshot.isPro, false);

  const result = syncWidgetSnapshot([], [], holidays, baseSettings, false);
  assert.equal(typeof result, 'boolean');
});
