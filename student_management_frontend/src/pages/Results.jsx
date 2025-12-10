import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Input, Select } from '../components/Input';
import EmptyState from '../components/EmptyState';
import { api } from '../api/client';
import { computeStudentAggregates, DEFAULT_GRADE_THRESHOLDS } from '../utils/grades';

function toCSV(rows, headers) {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = headers.map((h) => escape(h.label)).join(',');
  const body = rows
    .map((r) => headers.map((h) => escape(typeof h.accessor === 'function' ? h.accessor(r) : r[h.accessor])).join(','))
    .join('\n');
  return `${head}\n${body}`;
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// PUBLIC_INTERFACE
export default function Results() {
  /**
   * Results/Reports:
   * - Filters: class, section, exam, subject
   * - Subject-wise table of students and marks
   * - Overall per-student aggregates (total, average, percentage, grade)
   * - Export CSV
   */
  const [klass, setKlass] = useState('10');
  const [section, setSection] = useState('A');
  const [examId, setExamId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]); // [{ id, studentId, subjectId, score }]
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.academics.listExams().then(setExams).catch(() => {});
    api.academics.listSubjects().then(setSubjects).catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      if (!klass || !section || !examId) return;
      setLoading(true);
      try {
        const [stu, m] = await Promise.all([
          api.academics.listStudentsForClassSection(klass, section),
          api.academics.listMarks({ examId, klass, section }),
        ]);
        const st = (Array.isArray(stu) ? stu : []).map((s, i) => ({
          id: s.id ?? `stu-${i + 1}`,
          name: s.name ?? '',
          rollNumber: s.rollNumber ?? '',
        }));
        setStudents(st);
        const mm = Array.isArray(m) ? m : [];
        setMarks(mm);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [klass, section, examId]);

  const subjectRows = useMemo(() => {
    if (!subjectId) return [];
    const mapByStudent = new Map();
    students.forEach((s) => mapByStudent.set(s.id, { ...s, score: '-' }));
    marks
      .filter((mk) => mk.subjectId === subjectId)
      .forEach((mk) => {
        if (mapByStudent.has(mk.studentId)) {
          mapByStudent.set(mk.studentId, { ...mapByStudent.get(mk.studentId), score: Number(mk.score) || 0 });
        }
      });
    return Array.from(mapByStudent.values());
  }, [students, marks, subjectId]);

  const overallRows = useMemo(() => {
    // Build per-student subject marks array
    const byStudent = new Map();
    for (const s of students) {
      byStudent.set(s.id, []);
    }
    for (const mk of marks) {
      if (byStudent.has(mk.studentId)) {
        byStudent.get(mk.studentId).push({ subjectId: mk.subjectId, score: Number(mk.score) || 0 });
      }
    }
    const out = students.map((s) => {
      const aggregates = computeStudentAggregates({ marks: byStudent.get(s.id) || [], thresholds: DEFAULT_GRADE_THRESHOLDS });
      return {
        ...s,
        total: Math.round(aggregates.total),
        average: Math.round(aggregates.average * 100) / 100,
        percentage: Math.round(aggregates.percentage * 100) / 100,
        grade: aggregates.grade,
      };
    });
    return out;
  }, [students, marks]);

  function exportSubjectCSV() {
    const headers = [
      { label: 'Roll Number', accessor: 'rollNumber' },
      { label: 'Student Name', accessor: 'name' },
      { label: 'Score', accessor: 'score' },
    ];
    const csv = toCSV(subjectRows, headers);
    download(`results_subject_${subjectId || 'all'}.csv`, csv);
  }

  function exportOverallCSV() {
    const headers = [
      { label: 'Roll Number', accessor: 'rollNumber' },
      { label: 'Student Name', accessor: 'name' },
      { label: 'Total', accessor: 'total' },
      { label: 'Average', accessor: 'average' },
      { label: 'Percentage', accessor: 'percentage' },
      { label: 'Grade', accessor: 'grade' },
    ];
    const csv = toCSV(overallRows, headers);
    download(`results_overall_${examId || 'exam'}.csv`, csv);
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <Card
        title="Results & Reports"
        headerRight={
          <div className="row" style={{ alignItems: 'flex-end' }}>
            <Input id="class" label="Class" value={klass} onChange={(e) => setKlass(e.target.value)} style={{ width: 120 }} />
            <Input id="section" label="Section" value={section} onChange={(e) => setSection(e.target.value)} style={{ width: 120 }} />
            <Select id="exam" label="Exam" value={examId} onChange={(e) => setExamId(e.target.value)} style={{ minWidth: 200 }}>
              <option value="">Select Exam</option>
              {(exams || []).map((ex) => (
                <option key={ex.id || ex.name} value={ex.id || ex.name}>{ex.name}</option>
              ))}
            </Select>
            <Select id="subject" label="Subject (optional)" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} style={{ minWidth: 200 }}>
              <option value="">All Subjects</option>
              {(subjects || []).map((s) => (
                <option key={s.id || s.name} value={s.id || s.name}>{s.name}</option>
              ))}
            </Select>
          </div>
        }
      >
        {loading ? (
          <div className="skeleton" style={{ height: 140 }} />
        ) : !examId ? (
          <EmptyState title="Select filters" description="Choose exam (and optionally subject) to view results." />
        ) : (
          <>
            <div className="grid cols-2">
              <div className="card" role="region" aria-label="Subject-wise results">
                <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Subject-wise Results {subjectId ? '' : '(Select a subject)'}</strong>
                  <Button variant="ghost" onClick={exportSubjectCSV} disabled={!subjectId}>Export CSV</Button>
                </div>
                {subjectId ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Roll #</th>
                        <th>Student</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectRows.map((r) => (
                        <tr key={r.id}>
                          <td>{r.rollNumber || '-'}</td>
                          <td>{r.name}</td>
                          <td>{r.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: 16 }}>Select a subject to view subject-wise results.</div>
                )}
              </div>

              <div className="card" role="region" aria-label="Overall results">
                <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Overall Performance (All Subjects)</strong>
                  <Button variant="ghost" onClick={exportOverallCSV} disabled={!overallRows.length}>Export CSV</Button>
                </div>
                {overallRows.length === 0 ? (
                  <div style={{ padding: 16 }}>No data to display.</div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Roll #</th>
                        <th>Student</th>
                        <th>Total</th>
                        <th>Average</th>
                        <th>Percentage</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overallRows.map((r) => (
                        <tr key={r.id}>
                          <td>{r.rollNumber || '-'}</td>
                          <td>{r.name}</td>
                          <td>{r.total}</td>
                          <td>{r.average}</td>
                          <td>{r.percentage}</td>
                          <td>{r.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
