import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateBackupPayload } from '../backup.ts';

describe('validateBackupPayload', () => {
  const validPayload = {
    version: 1,
    exportedAt: '2026-11-15T08:00:00Z',
    subjects: [
      {
        id: 'sub-1',
        name: 'Mathematics',
        code: 'MATH101',
        color: '#1FB45A',
        targetPct: 75,
        baselinePresent: 10,
        baselineAbsent: 2,
        startDate: '2026-08-01',
        endDate: '2026-12-15',
        archivedAt: null,
        createdAt: '2026-08-01T00:00:00Z',
      },
    ],
    scheduleSlots: [
      {
        id: 'slot-1',
        subjectId: 'sub-1',
        weekday: 1,
        startTime: '09:00',
        endTime: '10:00',
        effectiveFrom: '2026-08-01',
      },
    ],
    sessions: [
      {
        id: 'ses-1',
        subjectId: 'sub-1',
        slotId: 'slot-1',
        date: '2026-08-03',
        startTime: '09:00',
        endTime: '10:00',
        status: 'present',
        markedAt: '2026-08-03T09:05:00Z',
      },
    ],
    holidays: [
      {
        date: '2026-10-02',
        label: 'National Holiday',
      },
    ],
    settings: {
      globalTargetPct: 75,
      theme: 'system',
      primaryCardLabel: 'name',
    },
  };

  it('approves a complete valid backup payload', () => {
    assert.equal(validateBackupPayload(validPayload), true);
  });

  it('approves minimal valid backup with empty optional arrays', () => {
    const minimal = {
      version: 1,
      subjects: [
        {
          id: 'sub-min',
          name: 'Physics',
          startDate: '2026-09-01',
        },
      ],
    };
    assert.equal(validateBackupPayload(minimal), true);
  });

  it('rejects null, non-object, and empty inputs', () => {
    assert.equal(validateBackupPayload(null), false);
    assert.equal(validateBackupPayload(undefined), false);
    assert.equal(validateBackupPayload(''), false);
    assert.equal(validateBackupPayload(123), false);
    assert.equal(validateBackupPayload([]), false);
  });

  it('rejects payload with invalid or missing version', () => {
    assert.equal(validateBackupPayload({ ...validPayload, version: 0 }), false);
    assert.equal(validateBackupPayload({ ...validPayload, version: '1' }), false);
    assert.equal(validateBackupPayload({ ...validPayload, version: undefined }), false);
  });

  it('rejects payload when subjects is not an array', () => {
    assert.equal(validateBackupPayload({ ...validPayload, subjects: null }), false);
    assert.equal(validateBackupPayload({ ...validPayload, subjects: 'none' }), false);
  });

  it('rejects subjects missing required properties', () => {
    // Missing id
    assert.equal(
      validateBackupPayload({
        ...validPayload,
        subjects: [{ name: 'Math', startDate: '2026-01-01' }],
      }),
      false
    );
    // Missing name
    assert.equal(
      validateBackupPayload({
        ...validPayload,
        subjects: [{ id: 's1', startDate: '2026-01-01' }],
      }),
      false
    );
    // Missing startDate
    assert.equal(
      validateBackupPayload({
        ...validPayload,
        subjects: [{ id: 's1', name: 'Math' }],
      }),
      false
    );
  });

  it('rejects malformed scheduleSlots', () => {
    assert.equal(
      validateBackupPayload({
        ...validPayload,
        scheduleSlots: 'not-an-array',
      }),
      false
    );
    assert.equal(
      validateBackupPayload({
        ...validPayload,
        scheduleSlots: [{ id: 'slot-1', subjectId: 's1', weekday: 'one' }],
      }),
      false
    );
  });

  it('rejects malformed sessions', () => {
    assert.equal(
      validateBackupPayload({
        ...validPayload,
        sessions: [{ id: 'ses-1', subjectId: 's1', date: 12345 }],
      }),
      false
    );
  });

  it('rejects malformed holidays', () => {
    assert.equal(
      validateBackupPayload({
        ...validPayload,
        holidays: [{ label: 'Missing date' }],
      }),
      false
    );
  });

  it('rejects invalid settings format', () => {
    assert.equal(
      validateBackupPayload({
        ...validPayload,
        settings: 'not-an-object',
      }),
      false
    );
  });
});
