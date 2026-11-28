import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeSubjectStats,
  computePooledStats,
  formatTime12h,
  formatTimeRange12h,
  diffScheduleSlots,
  filterVisibleSessionsForDate,
} from '../attendance.ts';
import type { Subject, Session, ScheduleSlot } from '../../types/index.ts';

test('Physics attendance matches screenshot (37/45 -> 82%, Can miss 4)', () => {
  const subject: Subject = {
    id: 'sub-physics',
    name: 'Physics',
    code: 'PHY101',
    color: '#1E9BFF',
    targetPct: 75,
    baselinePresent: 37,
    baselineAbsent: 8,
    startDate: '2026-08-01',
    endDate: null,
    archivedAt: null,
    createdAt: '2026-08-01T00:00:00Z',
  };

  const stats = computeSubjectStats(subject, [], new Set(), 75);
  assert.equal(stats.attended, 37);
  assert.equal(stats.absent, 8);
  assert.equal(stats.totalHeld, 45);
  assert.equal(Math.round(stats.percentage), 82);
  assert.equal(stats.canMiss, 4);
  assert.equal(stats.statusLabel, 'Can miss 4');
  assert.equal(stats.isSafe, true);
});

test('Data Structures attendance matches screenshot (17/24 -> 71%, Attend next 4)', () => {
  const subject: Subject = {
    id: 'sub-ds',
    name: 'Data Structures',
    code: 'CS201',
    color: '#A25CF2',
    targetPct: 75,
    baselinePresent: 17,
    baselineAbsent: 7,
    startDate: '2026-08-01',
    endDate: null,
    archivedAt: null,
    createdAt: '2026-08-01T00:00:00Z',
  };

  const stats = computeSubjectStats(subject, [], new Set(), 75);
  assert.equal(stats.attended, 17);
  assert.equal(stats.absent, 7);
  assert.equal(stats.totalHeld, 24);
  assert.equal(Math.round(stats.percentage), 71);
  assert.equal(stats.mustAttend, 4);
  assert.equal(stats.statusLabel, 'Attend next 4');
  assert.equal(stats.isBelow, true);
});

test('Economics attendance matches screenshot (19/25 -> 76%, Can miss 0)', () => {
  const subject: Subject = {
    id: 'sub-econ',
    name: 'Economics',
    code: 'ECO110',
    color: '#FF8A1F',
    targetPct: 75,
    baselinePresent: 19,
    baselineAbsent: 6,
    startDate: '2026-08-01',
    endDate: null,
    archivedAt: null,
    createdAt: '2026-08-01T00:00:00Z',
  };

  const stats = computeSubjectStats(subject, [], new Set(), 75);
  assert.equal(stats.attended, 19);
  assert.equal(stats.absent, 6);
  assert.equal(stats.totalHeld, 25);
  assert.equal(Math.round(stats.percentage), 76);
  assert.equal(stats.canMiss, 0);
  assert.equal(stats.statusLabel, 'Can miss 0');
  assert.equal(stats.isClose, true);
});

test('Chemistry attendance matches screenshot (27/30 -> 90%, Can miss 6)', () => {
  const subject: Subject = {
    id: 'sub-chem',
    name: 'Chemistry',
    code: 'CHE102',
    color: '#1FB45A',
    targetPct: 75,
    baselinePresent: 27,
    baselineAbsent: 3,
    startDate: '2026-08-01',
    endDate: null,
    archivedAt: null,
    createdAt: '2026-08-01T00:00:00Z',
  };

  const stats = computeSubjectStats(subject, [], new Set(), 75);
  assert.equal(stats.attended, 27);
  assert.equal(stats.absent, 3);
  assert.equal(stats.totalHeld, 30);
  assert.equal(Math.round(stats.percentage), 90);
  assert.equal(stats.canMiss, 6);
  assert.equal(stats.statusLabel, 'Can miss 6');
  assert.equal(stats.isSafe, true);
});

test('Pooled attendance matches hero card (100/124 -> 81%, 1 below target)', () => {
  const subjects: Subject[] = [
    {
      id: 'sub-physics',
      name: 'Physics',
      code: 'PHY101',
      color: '#1E9BFF',
      targetPct: 75,
      baselinePresent: 37,
      baselineAbsent: 8,
      startDate: '2026-08-01',
      endDate: null,
      archivedAt: null,
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'sub-ds',
      name: 'Data Structures',
      code: 'CS201',
      color: '#A25CF2',
      targetPct: 75,
      baselinePresent: 17,
      baselineAbsent: 7,
      startDate: '2026-08-01',
      endDate: null,
      archivedAt: null,
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'sub-econ',
      name: 'Economics',
      code: 'ECO110',
      color: '#FF8A1F',
      targetPct: 75,
      baselinePresent: 19,
      baselineAbsent: 6,
      startDate: '2026-08-01',
      endDate: null,
      archivedAt: null,
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'sub-chem',
      name: 'Chemistry',
      code: 'CHE102',
      color: '#1FB45A',
      targetPct: 75,
      baselinePresent: 27,
      baselineAbsent: 3,
      startDate: '2026-08-01',
      endDate: null,
      archivedAt: null,
      createdAt: '2026-08-01T00:00:00Z',
    },
  ];

  const statsList = subjects.map((s) => computeSubjectStats(s, [], new Set(), 75));
  const pooled = computePooledStats(statsList, 75);

  assert.equal(pooled.totalAttended, 100);
  assert.equal(pooled.totalAbsent, 24);
  assert.equal(pooled.totalHeld, 124);
  assert.equal(Math.round(pooled.pooledPercentage), 81);
  assert.equal(pooled.subjectsBelowTarget, 1);
  assert.equal(pooled.statusTier, 'safe');
});

test('Pooled attendance with 0 subjects returns neutral tier and 0% percentage', () => {
  const pooled = computePooledStats([], 75);
  assert.equal(pooled.totalAttended, 0);
  assert.equal(pooled.totalAbsent, 0);
  assert.equal(pooled.totalHeld, 0);
  assert.equal(pooled.pooledPercentage, 0);
  assert.equal(pooled.subjectsBelowTarget, 0);
  assert.equal(pooled.statusTier, 'neutral');
});

test('Pooled attendance with subjects but 0 classes held returns neutral tier', () => {
  const subjects: Subject[] = [
    {
      id: 'sub-new',
      name: 'New Subject',
      code: 'NEW101',
      color: '#1E9BFF',
      targetPct: 75,
      baselinePresent: 0,
      baselineAbsent: 0,
      startDate: '2026-08-01',
      endDate: null,
      archivedAt: null,
      createdAt: '2026-08-01T00:00:00Z',
    },
  ];
  const statsList = subjects.map((s) => computeSubjectStats(s, [], new Set(), 75));
  const pooled = computePooledStats(statsList, 75);
  assert.equal(pooled.totalHeld, 0);
  assert.equal(pooled.pooledPercentage, 0);
  assert.equal(pooled.statusTier, 'neutral');
});

test('Negative baseline inputs are clamped to non-negative values and do not corrupt math', () => {
  const subject: Subject = {
    id: 'sub-neg',
    name: 'Negative Test',
    code: 'NEG101',
    color: '#1E9BFF',
    targetPct: 75,
    baselinePresent: -10 as any,
    baselineAbsent: -5 as any,
    startDate: '2026-08-01',
    endDate: null,
    archivedAt: null,
    createdAt: '2026-08-01T00:00:00Z',
  };

  const stats = computeSubjectStats(subject, [], new Set(), 75);
  assert.ok(stats.attended >= 0, 'Attended must be non-negative');
  assert.ok(stats.absent >= 0, 'Absent must be non-negative');
  assert.ok(stats.percentage >= 0 && stats.percentage <= 100, 'Percentage must be between 0 and 100');
});

test('Single attended class (1/1) returns 100% Streak status label', () => {
  const subject: Subject = {
    id: 'sub-first',
    name: 'First Lecture',
    code: 'FST101',
    color: '#1E9BFF',
    targetPct: 75,
    baselinePresent: 0,
    baselineAbsent: 0,
    startDate: '2026-08-01',
    endDate: null,
    archivedAt: null,
    createdAt: '2026-08-01T00:00:00Z',
  };

  const attendanceLog: Session[] = [
    {
      id: 'log-1',
      subjectId: 'sub-first',
      slotId: 'slot-1',
      date: '2026-08-01',
      startTime: '10:00',
      endTime: '11:00',
      status: 'present',
      markedAt: '2026-08-01T10:00:00Z',
    },
  ];

  const stats = computeSubjectStats(subject, attendanceLog, new Set(), 75);
  assert.equal(stats.attended, 1);
  assert.equal(stats.totalHeld, 1);
  assert.equal(stats.percentage, 100);
  assert.equal(stats.statusLabel, '100% Streak');
});

test('String baseline inputs are coerced to numbers without string concatenation', () => {
  const subject: Subject = {
    id: 'sub-str',
    name: 'String Test',
    code: 'STR101',
    color: '#1E9BFF',
    targetPct: 75,
    baselinePresent: '10' as any,
    baselineAbsent: '2' as any,
    startDate: '2026-08-01',
    endDate: null,
    archivedAt: null,
    createdAt: '2026-08-01T00:00:00Z',
  };

  const attendanceLog: Session[] = [
    {
      id: 'log-1',
      subjectId: 'sub-str',
      slotId: 'slot-1',
      date: '2026-08-01',
      startTime: '10:00',
      endTime: '11:00',
      status: 'present',
      markedAt: '2026-08-01T10:00:00Z',
    },
  ];

  const stats = computeSubjectStats(subject, attendanceLog, new Set(), 75);
  assert.equal(stats.attended, 11);
  assert.equal(stats.absent, 2);
  assert.equal(stats.totalHeld, 13);
  assert.equal(Number.isNaN(stats.percentage), false);
});

test('Subject with 0 classes held returns 0% percentage, neutral status, and No classes yet label', () => {
  const subject: Subject = {
    id: 'sub-zero',
    name: 'Zero Subject',
    code: 'ZERO101',
    color: '#1E9BFF',
    targetPct: 75,
    baselinePresent: 0,
    baselineAbsent: 0,
    startDate: '2026-08-01',
    endDate: null,
    archivedAt: null,
    createdAt: '2026-08-01T00:00:00Z',
  };

  const stats = computeSubjectStats(subject, [], new Set(), 75);
  assert.equal(stats.attended, 0);
  assert.equal(stats.absent, 0);
  assert.equal(stats.totalHeld, 0);
  assert.equal(stats.percentage, 0);
  assert.equal(stats.isSafe, false);
  assert.equal(stats.isBelow, false);
  assert.equal(stats.isClose, false);
  assert.equal(stats.canMiss, 0);
  assert.equal(stats.mustAttend, 0);
  assert.equal(stats.statusLabel, 'No classes yet');
});

test('formatTime12h formats 24h time strings to 12h format with AM/PM', () => {
  assert.equal(formatTime12h('00:00'), '12:00 AM');
  assert.equal(formatTime12h('00:15'), '12:15 AM');
  assert.equal(formatTime12h('09:00'), '9:00 AM');
  assert.equal(formatTime12h('09:05'), '9:05 AM');
  assert.equal(formatTime12h('11:59'), '11:59 AM');
  assert.equal(formatTime12h('12:00'), '12:00 PM');
  assert.equal(formatTime12h('12:30'), '12:30 PM');
  assert.equal(formatTime12h('13:00'), '1:00 PM');
  assert.equal(formatTime12h('14:00'), '2:00 PM');
  assert.equal(formatTime12h('15:45'), '3:45 PM');
  assert.equal(formatTime12h('23:59'), '11:59 PM');
  assert.equal(formatTime12h(''), '');
  assert.equal(formatTime12h(null), '');
  assert.equal(formatTime12h(undefined), '');
});

test('formatTimeRange12h formats start and end time ranges to 12h format', () => {
  assert.equal(formatTimeRange12h('09:00', '10:00'), '9:00 AM - 10:00 AM');
  assert.equal(formatTimeRange12h('13:00', '14:30'), '1:00 PM - 2:30 PM');
  assert.equal(formatTimeRange12h('11:00', '13:00', ' – '), '11:00 AM – 1:00 PM');
  assert.equal(formatTimeRange12h('14:00', null), '2:00 PM');
  assert.equal(formatTimeRange12h(null, '15:00'), '3:00 PM');
  assert.equal(formatTimeRange12h(null, null), '');
});

test('diffScheduleSlots preserves unchanged slots when baseline counts or metadata are edited', () => {
  const existingSlots: ScheduleSlot[] = [
    {
      id: 'slot-vcp-fri',
      subjectId: 'sub-vcp',
      weekday: 5,
      startTime: '09:00',
      endTime: '12:00',
      effectiveFrom: '2026-11-20',
      effectiveTo: null,
    },
    {
      id: 'slot-vcp-mon',
      subjectId: 'sub-vcp',
      weekday: 1,
      startTime: '10:00',
      endTime: '11:00',
      effectiveFrom: '2026-11-20',
      effectiveTo: null,
    },
  ];

  // Re-save with exact same timetable slots (e.g. only baselineAbsent changed)
  const diffUnchanged = diffScheduleSlots(existingSlots, [
    { weekday: 5, startTime: '09:00', endTime: '12:00' },
    { weekday: 1, startTime: '10:00', endTime: '11:00' },
  ]);
  assert.equal(diffUnchanged.keptSlots.length, 2);
  assert.equal(diffUnchanged.retiredSlots.length, 0);
  assert.equal(diffUnchanged.addedSlots.length, 0);

  // Edit Monday's slot time and keep Friday unchanged
  const diffPartial = diffScheduleSlots(existingSlots, [
    { weekday: 5, startTime: '09:00', endTime: '12:00' },
    { weekday: 1, startTime: '11:00', endTime: '12:00' },
  ]);
  assert.equal(diffPartial.keptSlots.map((s) => s.id).join(','), 'slot-vcp-fri');
  assert.equal(diffPartial.retiredSlots.map((s) => s.id).join(','), 'slot-vcp-mon');
  assert.deepEqual(diffPartial.addedSlots, [
    { weekday: 1, startTime: '11:00', endTime: '12:00' },
  ]);
});

test('filterVisibleSessionsForDate drops unmarked orphaned slot sessions but keeps marked and extra classes', () => {
  const sessions: Session[] = [
    {
      id: 'ses-unmarked-retired',
      subjectId: 'sub-1',
      slotId: 'slot-retired',
      date: '2026-11-27',
      startTime: '09:00',
      endTime: '12:00',
      status: null,
      markedAt: null,
    },
    {
      id: 'ses-marked-retired',
      subjectId: 'sub-1',
      slotId: 'slot-retired',
      date: '2026-11-27',
      startTime: '09:00',
      endTime: '12:00',
      status: 'absent',
      markedAt: '2026-11-27T09:10:00Z',
    },
    {
      id: 'ses-active',
      subjectId: 'sub-1',
      slotId: 'slot-active',
      date: '2026-11-27',
      startTime: '14:00',
      endTime: '15:00',
      status: null,
      markedAt: null,
    },
    {
      id: 'ses-extra',
      subjectId: 'sub-1',
      slotId: null,
      date: '2026-11-27',
      startTime: '16:00',
      endTime: '17:00',
      status: null,
      markedAt: null,
    },
  ];

  const visible = filterVisibleSessionsForDate(
    sessions,
    new Set(['slot-active']),
    new Set(['sub-1'])
  );

  assert.deepEqual(
    visible.map((s) => s.id),
    ['ses-marked-retired', 'ses-active', 'ses-extra']
  );
});
