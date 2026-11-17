import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateClassReminderCopy,
  generateUnmarkedCatchupCopy,
  getUnmarkedCountForDate,
} from '../notifications.ts';
import type { Subject, SubjectStats, ScheduleSlot, Session } from '../../types/index.ts';

const dummySubject: Subject = {
  id: 'sub-1',
  name: 'Physics',
  code: 'PHY101',
  color: '#3B82F6',
  targetPct: 75,
  baselinePresent: 30,
  baselineAbsent: 10,
  startDate: '2026-09-01',
  endDate: null,
  archivedAt: null,
  createdAt: '2026-09-01T00:00:00Z',
};

test('generateClassReminderCopy formats safe buffer alerts correctly without emojis', () => {
  const safeStats: SubjectStats = {
    subject: dummySubject,
    attended: 37,
    absent: 8,
    totalHeld: 45,
    percentage: 82.2,
    effectiveTarget: 75,
    isSafe: true,
    isClose: false,
    isBelow: false,
    canMiss: 4,
    mustAttend: 0,
    statusLabel: 'Can miss 4',
  };

  const copy = generateClassReminderCopy(dummySubject, safeStats, '10:00', 15);
  assert.equal(copy.title, 'Physics · 10:00');
  assert.equal(copy.body, 'Can miss 4 classes · 82.2% attendance');
});

test('generateClassReminderCopy formats zero-skip safe buffer correctly without emojis', () => {
  const zeroSkipStats: SubjectStats = {
    subject: dummySubject,
    attended: 30,
    absent: 10,
    totalHeld: 40,
    percentage: 75,
    effectiveTarget: 75,
    isSafe: false,
    isClose: true,
    isBelow: false,
    canMiss: 0,
    mustAttend: 0,
    statusLabel: 'Can miss 0',
  };

  const copy = generateClassReminderCopy(dummySubject, zeroSkipStats, '11:30', 5);
  assert.equal(copy.title, 'Physics · 11:30');
  assert.equal(copy.body, 'Cannot miss today · Currently at 75% target');
});

test('generateClassReminderCopy formats at-risk alert when below cutoff without emojis', () => {
  const riskStats: SubjectStats = {
    subject: dummySubject,
    attended: 17,
    absent: 7,
    totalHeld: 24,
    percentage: 70.8,
    effectiveTarget: 75,
    isSafe: false,
    isClose: false,
    isBelow: true,
    canMiss: 0,
    mustAttend: 4,
    statusLabel: 'Attend next 4',
  };

  const copy = generateClassReminderCopy(dummySubject, riskStats, '14:00', 10);
  assert.equal(copy.title, 'Physics · 14:00');
  assert.equal(copy.body, 'Must attend next 4 classes · Currently 70.8%');
});

test('generateClassReminderCopy handles singular class recovery grammar', () => {
  const riskStatsSingular: SubjectStats = {
    subject: dummySubject,
    attended: 22,
    absent: 8,
    totalHeld: 30,
    percentage: 73.3,
    effectiveTarget: 75,
    isSafe: false,
    isClose: false,
    isBelow: true,
    canMiss: 0,
    mustAttend: 1,
    statusLabel: 'Attend next 1',
  };

  const copy = generateClassReminderCopy(dummySubject, riskStatsSingular, '09:00', 5);
  assert.equal(copy.title, 'Physics · 09:00');
  assert.equal(copy.body, 'Must attend next 1 class · Currently 73.3%');
});

test('generateClassReminderCopy formats zero-held class notification correctly', () => {
  const zeroStats: SubjectStats = {
    subject: dummySubject,
    attended: 0,
    absent: 0,
    totalHeld: 0,
    percentage: 0,
    effectiveTarget: 75,
    isSafe: false,
    isClose: false,
    isBelow: false,
    canMiss: 0,
    mustAttend: 0,
    statusLabel: 'No classes yet',
  };

  const copy = generateClassReminderCopy(dummySubject, zeroStats, '09:00', 10);
  assert.equal(copy.title, 'Physics · 09:00');
  assert.equal(copy.body, 'First class today · Target is 75%');
});

test('generateUnmarkedCatchupCopy formats single unmarked class with subject name', () => {
  const copy = generateUnmarkedCatchupCopy(1, 'Calculus');
  assert.equal(copy.title, 'Unmarked Class Remaining');
  assert.equal(
    copy.body,
    'You have 1 class left to mark today (Calculus). Tap to log your attendance.'
  );
});

test('generateUnmarkedCatchupCopy formats multiple unmarked classes', () => {
  const copy = generateUnmarkedCatchupCopy(3);
  assert.equal(copy.title, 'Unmarked Classes Remaining');
  assert.equal(
    copy.body,
    'You have 3 classes left to mark today. Tap to log your attendance.'
  );
});

test('getUnmarkedCountForDate returns 0 on holidays', () => {
  const holidays = new Set(['2026-11-12']);
  const result = getUnmarkedCountForDate(
    '2026-11-12',
    4,
    [],
    new Map(),
    [],
    holidays
  );
  assert.equal(result.count, 0);
});

test('getUnmarkedCountForDate accurately reports unmarked slots and ignores marked sessions', () => {
  const slot1: ScheduleSlot = {
    id: 'slot-1',
    subjectId: 'sub-1',
    weekday: 1, // Mon
    startTime: '09:00',
    endTime: '10:00',
    effectiveFrom: '2026-09-01',
    effectiveTo: null,
  };
  const slot2: ScheduleSlot = {
    id: 'slot-2',
    subjectId: 'sub-1',
    weekday: 1, // Mon
    startTime: '11:00',
    endTime: '12:00',
    effectiveFrom: '2026-09-01',
    effectiveTo: null,
  };

  const subjectsMap = new Map([['sub-1', dummySubject]]);

  // Case A: 2 slots on Monday, 0 sessions marked yet
  const resA = getUnmarkedCountForDate('2026-11-16', 1, [slot1, slot2], subjectsMap, [], new Set());
  assert.equal(resA.count, 2);
  assert.equal(resA.sampleSubjectName, 'Physics');

  // Case B: 1 marked as present, 1 unmarked
  const session1: Session = {
    id: 'sess-1',
    subjectId: 'sub-1',
    slotId: 'slot-1',
    date: '2026-11-16',
    startTime: '09:00',
    endTime: '10:00',
    status: 'present',
    markedAt: '2026-11-16T09:30:00Z',
  };
  const resB = getUnmarkedCountForDate(
    '2026-11-16',
    1,
    [slot1, slot2],
    subjectsMap,
    [session1],
    new Set()
  );
  assert.equal(resB.count, 1);

  // Case C: Both marked (present & absent) -> 0 unmarked
  const session2: Session = {
    id: 'sess-2',
    subjectId: 'sub-1',
    slotId: 'slot-2',
    date: '2026-11-16',
    startTime: '11:00',
    endTime: '12:00',
    status: 'absent',
    markedAt: '2026-11-16T12:05:00Z',
  };
  const resC = getUnmarkedCountForDate(
    '2026-11-16',
    1,
    [slot1, slot2],
    subjectsMap,
    [session1, session2],
    new Set()
  );
  assert.equal(resC.count, 0);
});
