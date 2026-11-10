import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectSubjectCategory,
  SUBJECT_CATEGORY_METAS,
} from '../subjectCategory.ts';
import type { SubjectCategoryKey } from '../subjectCategory.ts';

test('1. Physics (PHY101) maps to atom & quantum category', () => {
  const result1 = detectSubjectCategory('Physics', 'PHY101');
  assert.equal(result1.key, 'physics');
  assert.equal(result1.label, 'Physics & Quantum');

  const resultByCodeOnly = detectSubjectCategory('', 'PHY101');
  assert.equal(resultByCodeOnly.key, 'physics');

  const resultBySubfield = detectSubjectCategory('Quantum Mechanics', '');
  assert.equal(resultBySubfield.key, 'physics');
});

test('2. Data Structures (CS201) maps to computer science & binary tree category', () => {
  const result1 = detectSubjectCategory('Data Structures', 'CS201');
  assert.equal(result1.key, 'computer-science');
  assert.equal(result1.label, 'Computer Science & Data Structures');

  const resultByCodeOnly = detectSubjectCategory('', 'CS201');
  assert.equal(resultByCodeOnly.key, 'computer-science');

  const resultByNameOnly = detectSubjectCategory('Algorithms & DSA');
  assert.equal(resultByNameOnly.key, 'computer-science');
});

test('3. Economics (ECO110) maps to economics & financial trend category', () => {
  const result1 = detectSubjectCategory('Economics', 'ECO110');
  assert.equal(result1.key, 'economics');
  assert.equal(result1.label, 'Economics & Finance');

  const resultByCodeOnly = detectSubjectCategory('', 'ECO110');
  assert.equal(resultByCodeOnly.key, 'economics');

  const resultBySubfield = detectSubjectCategory('Microeconomics');
  assert.equal(resultBySubfield.key, 'economics');
});

test('4. Chemistry (CHE102) maps to chemistry & Erlenmeyer flask category', () => {
  const result1 = detectSubjectCategory('Chemistry', 'CHE102');
  assert.equal(result1.key, 'chemistry');
  assert.equal(result1.label, 'Chemistry & Materials');

  const resultByCodeOnly = detectSubjectCategory('', 'CHE102');
  assert.equal(resultByCodeOnly.key, 'chemistry');

  const resultBySubfield = detectSubjectCategory('Organic Chemistry');
  assert.equal(resultBySubfield.key, 'chemistry');
});

test('5. Other academic disciplines map accurately', () => {
  assert.equal(detectSubjectCategory('Calculus II', 'MAT201').key, 'mathematics');
  assert.equal(detectSubjectCategory('Cellular Biology', 'BIO101').key, 'biology');
  assert.equal(detectSubjectCategory('Clinical Medicine', 'MED100').key, 'medicine');
  assert.equal(detectSubjectCategory('VLSI Circuits', 'EE301').key, 'electrical');
  assert.equal(detectSubjectCategory('Fluid Mechanics', 'ME204').key, 'engineering');
  assert.equal(detectSubjectCategory('World Literature', 'ENG101').key, 'literature');
  assert.equal(detectSubjectCategory('Spanish Conversation', 'SPA101').key, 'languages');
  assert.equal(detectSubjectCategory('European History', 'HIS201').key, 'history');
  assert.equal(detectSubjectCategory('Constitutional Law', 'LAW301').key, 'law');
  assert.equal(detectSubjectCategory('Cognitive Psychology', 'PSY101').key, 'psychology');
  assert.equal(detectSubjectCategory('Graphic Design', 'ART102').key, 'art');
  assert.equal(detectSubjectCategory('Music Theory', 'MUS105').key, 'music');
  assert.equal(detectSubjectCategory('Physical Geography', 'GEO101').key, 'geography');
  assert.equal(detectSubjectCategory('Physical Education', 'PE101').key, 'sports');
  assert.equal(detectSubjectCategory('Mass Communication', 'COMM101').key, 'media');
  assert.equal(detectSubjectCategory('Environmental Studies', 'ENV101').key, 'environment');
});

test('6. Edge cases: Empty, undefined, and unclassified subjects fallback to General Studies', () => {
  assert.equal(detectSubjectCategory('', '').key, 'general');
  assert.equal(detectSubjectCategory(undefined, undefined).key, 'general');
  assert.equal(detectSubjectCategory('   ', '   ').key, 'general');
  assert.equal(detectSubjectCategory('Random Topic XYZ', 'ABC999').key, 'general');
  assert.equal(detectSubjectCategory('Random Topic XYZ').label, 'General Studies');
});

test('7. All 29 academic categories are registered in SUBJECT_CATEGORY_METAS', () => {
  const keys: SubjectCategoryKey[] = [
    'physics',
    'computer-science',
    'economics',
    'chemistry',
    'mathematics',
    'biology',
    'medicine',
    'electrical',
    'engineering',
    'literature',
    'languages',
    'history',
    'law',
    'psychology',
    'art',
    'music',
    'geography',
    'sports',
    'media',
    'environment',
    'general',
    'veterinary',
    'anatomy',
    'physiology',
    'livestock',
    'pathology',
    'pharmacology',
    'database',
    'architecture',
  ];

  assert.equal(keys.length, 29);
  for (const k of keys) {
    assert.ok(SUBJECT_CATEGORY_METAS[k]);
    assert.equal(SUBJECT_CATEGORY_METAS[k].key, k);
    assert.ok(SUBJECT_CATEGORY_METAS[k].label.length > 0);
    assert.ok(SUBJECT_CATEGORY_METAS[k].description.length > 0);
  }
});

test('8. Functional concept detection for specialized streams (Veterinary, CS, Medical, etc.)', () => {
  // Veterinary student timetable subjects:
  assert.equal(detectSubjectCategory('Veterinary Physiology', 'VET101').key, 'physiology');
  assert.equal(detectSubjectCategory('Veterinary Anatomy', 'VET102').key, 'anatomy');
  assert.equal(detectSubjectCategory('Livestock Production Management', 'LPM101').key, 'livestock');
  assert.equal(detectSubjectCategory('Veterinary Pathology', 'VET201').key, 'pathology');
  assert.equal(detectSubjectCategory('Veterinary Pharmacology', 'VET202').key, 'pharmacology');
  assert.equal(detectSubjectCategory('Intro to Veterinary Science', 'VET100').key, 'veterinary');

  // CS student timetable subjects:
  assert.equal(detectSubjectCategory('Database Management Systems', 'CS202').key, 'database');
  assert.equal(detectSubjectCategory('Data Structures', 'CS201').key, 'computer-science');

  // Architecture:
  assert.equal(detectSubjectCategory('Urban Planning & Architecture', 'ARCH101').key, 'architecture');

  // Medicine & Morphology:
  assert.equal(detectSubjectCategory('Human Anatomy', 'MED100').key, 'anatomy');
  assert.equal(detectSubjectCategory('Cardiovascular Physiology', 'MED201').key, 'physiology');
});
