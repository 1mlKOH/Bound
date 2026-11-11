import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSubjectStats, computePooledStats } from '../attendance.ts';
import type { Subject, Session } from '../../types/index.ts';

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
