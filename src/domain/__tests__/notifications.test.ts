import test from 'node:test';
import assert from 'node:assert/strict';
import { generateClassReminderCopy } from '../notifications.ts';
import type { Subject, SubjectStats } from '../../types/index.ts';

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

test('generateClassReminderCopy formats safe buffer alerts correctly', () => {
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
  assert.equal(copy.title, '📚 Physics starts in 15m');
  assert.match(copy.body, /Safe buffer: \+4 skips available/);
  assert.match(copy.body, /82\.2%/);
  assert.match(copy.body, /Class starts at 10:00/);
});

test('generateClassReminderCopy formats zero-skip safe buffer correctly', () => {
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
  assert.equal(copy.title, '⚡ Physics starts in 5m (75%)');
  assert.match(copy.body, /On the edge of your 75% target/);
  assert.match(copy.body, /Missing today will drop you below cutoff!/);
});

test('generateClassReminderCopy formats at-risk alert when below cutoff', () => {
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
  assert.equal(copy.title, '⚠️ Physics starts in 10m (70.8%)');
  assert.match(copy.body, /Cutoff is 75%/);
  assert.match(copy.body, /Need next 4 classes to recover/);
  assert.match(copy.body, /Attendance required today!/);
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
  assert.match(copy.body, /Need next 1 class to recover/);
});
