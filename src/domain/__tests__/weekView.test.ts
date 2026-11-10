import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getMondayOfDate,
  getWeekDates,
  formatCardDate,
} from '../attendance.ts';

test('getMondayOfDate correctly resolves Monday for any day of the week', () => {
  // 2026-11-02 is Monday
  assert.equal(getMondayOfDate('2026-11-02'), '2026-11-02');
  // 2026-11-03 is Tuesday
  assert.equal(getMondayOfDate('2026-11-03'), '2026-11-02');
  // 2026-11-04 is Wednesday
  assert.equal(getMondayOfDate('2026-11-04'), '2026-11-02');
  // 2026-11-05 is Thursday
  assert.equal(getMondayOfDate('2026-11-05'), '2026-11-02');
  // 2026-11-06 is Friday
  assert.equal(getMondayOfDate('2026-11-06'), '2026-11-02');
  // 2026-11-07 is Saturday
  assert.equal(getMondayOfDate('2026-11-07'), '2026-11-02');
  // 2026-11-08 is Sunday (should still belong to week of Nov 2)
  assert.equal(getMondayOfDate('2026-11-08'), '2026-11-02');

  // Month-crossing edge case: 2026-11-01 is Sunday (belongs to week of Oct 26)
  assert.equal(getMondayOfDate('2026-11-01'), '2026-10-26');
});

test('getWeekDates returns 7 consecutive dates from Monday to Sunday matching screenshot', () => {
  const dates = getWeekDates('2026-11-02');
  assert.deepEqual(dates, [
    '2026-11-02',
    '2026-11-03',
    '2026-11-04',
    '2026-11-05',
    '2026-11-06',
    '2026-11-07',
    '2026-11-08',
  ]);
  // Date range label format matches reference screenshot: "2026-11-02 — 2026-11-08"
  assert.equal(`${dates[0]} — ${dates[6]}`, '2026-11-02 — 2026-11-08');
});

test('formatCardDate formats dates correctly for day agenda cards', () => {
  assert.equal(formatCardDate('2026-11-02'), 'Mon, Nov 2, 2026');
  assert.equal(formatCardDate('2026-11-03'), 'Tue, Nov 3, 2026');
  assert.equal(formatCardDate('2026-11-04'), 'Wed, Nov 4, 2026');
  assert.equal(formatCardDate('2026-11-05'), 'Thu, Nov 5, 2026');
  assert.equal(formatCardDate('2026-11-06'), 'Fri, Nov 6, 2026');
  assert.equal(formatCardDate('2026-11-07'), 'Sat, Nov 7, 2026');
  assert.equal(formatCardDate('2026-11-08'), 'Sun, Nov 8, 2026');
});
