//
// Grade calculation utilities with configurable thresholds
//

/**
 * Default grade thresholds mapping percentage => grade.
 * Order matters, thresholds are evaluated from highest to lowest.
 */
export const DEFAULT_GRADE_THRESHOLDS = [
  { min: 90, grade: 'A' },
  { min: 80, grade: 'B' },
  { min: 70, grade: 'C' },
  { min: 60, grade: 'D' },
  { min: 0, grade: 'F' },
];

/**
 * Normalize and validate thresholds.
 * Ensures descending order by min and coverage from 0 to 100.
 */
export function normalizeThresholds(thresholds = DEFAULT_GRADE_THRESHOLDS) {
  const list = Array.isArray(thresholds) ? thresholds.slice() : DEFAULT_GRADE_THRESHOLDS.slice();
  list.sort((a, b) => b.min - a.min);
  // Basic validation and coerce to numbers
  const cleaned = list.map((t) => ({
    min: Math.max(0, Math.min(100, Number(t.min))),
    grade: String(t.grade || '').trim() || '?',
  }));
  // Ensure there is at least a 0 floor
  const hasFloor = cleaned.some((t) => t.min === 0);
  if (!hasFloor) cleaned.push({ min: 0, grade: cleaned.at(-1)?.grade || 'F' });
  // Remove duplicates of same min keeping first
  const unique = [];
  const seen = new Set();
  for (const t of cleaned) {
    if (!seen.has(t.min)) {
      unique.push(t);
      seen.add(t.min);
    }
  }
  unique.sort((a, b) => b.min - a.min);
  return unique;
}

// PUBLIC_INTERFACE
export function calculateGrade(percentage, thresholds = DEFAULT_GRADE_THRESHOLDS) {
  /** Returns a letter grade for a given percentage based on configured thresholds. */
  const th = normalizeThresholds(thresholds);
  const pct = Math.max(0, Math.min(100, Number(percentage) || 0));
  for (const t of th) {
    if (pct >= t.min) return t.grade;
  }
  return th.at(-1)?.grade || 'F';
}

// PUBLIC_INTERFACE
export function computeStudentAggregates({ marks = [], maxPerSubject = 100, thresholds = DEFAULT_GRADE_THRESHOLDS }) {
  /**
   * Compute total, average, percentage, and grade for a set of subject marks for one student.
   * - marks: array of { subjectId, subjectName, score } with score in [0, maxPerSubject]
   * - maxPerSubject: default 100
   */
  const n = marks.length || 0;
  const maxTotal = n * (Number(maxPerSubject) || 100);
  const total = marks.reduce((sum, m) => sum + (Number(m.score) || 0), 0);
  const average = n > 0 ? total / n : 0;
  const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const grade = calculateGrade(percentage, thresholds);
  return { total, average, percentage, grade, maxTotal };
}

// PUBLIC_INTERFACE
export function aggregateClassPerformance(students = [], options = {}) {
  /**
   * Compute class-level aggregates from a list of { studentId, marks: [...] }.
   * Returns overall average percentage and grade distribution.
   */
  const thresholds = options.thresholds || DEFAULT_GRADE_THRESHOLDS;
  let count = 0;
  let pctSum = 0;
  const distribution = {};
  for (const s of students) {
    const { percentage, grade } = computeStudentAggregates({ marks: s.marks || [], thresholds });
    pctSum += percentage;
    count += 1;
    distribution[grade] = (distribution[grade] || 0) + 1;
  }
  const avgPercentage = count > 0 ? pctSum / count : 0;
  return {
    avgPercentage,
    avgGrade: calculateGrade(avgPercentage, thresholds),
    distribution,
    count,
  };
}
