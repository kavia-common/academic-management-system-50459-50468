import React, { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Input, Select } from '../components/Input';
import EmptyState from '../components/EmptyState';
import { api } from '../api/client';

// PUBLIC_INTERFACE
export default function Marks() {
  /**
   * Marks entry:
   * - Filters: class, section, exam, subject
   * - Shows students in selected class/section with input for marks
   * - Validates 0-100 by default
   * - Save with optimistic UI
   */
  const [klass, setKlass] = useState('10');
  const [section, setSection] = useState('A');
  const [examId, setExamId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // studentId -> { score, markId? }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const backupRef = useRef(null);

  // load exams and subjects on mount
  useEffect(() => {
    api.academics.listExams().then(setExams).catch(() => {});
    api.academics.listSubjects().then(setSubjects).catch(() => {});
  }, []);

  // load students and existing marks when filters change
  useEffect(() => {
    async function load() {
      if (!klass || !section) return;
      setLoading(true);
      setError('');
      try {
        const [stu, mks] = await Promise.all([
          api.academics.listStudentsForClassSection(klass, section),
          examId ? api.academics.listMarks({ examId, klass, section }) : Promise.resolve([]),
        ]);
        const st = (Array.isArray(stu) ? stu : []).map((s, i) => ({
          id: s.id ?? `stu-${i + 1}`,
          name: s.name ?? '',
          rollNumber: s.rollNumber ?? '',
        }));
        setStudents(st);
        // map marks by student
        const byStudent = {};
        (Array.isArray(mks) ? mks : []).forEach((mk) => {
          if (!subjectId || mk.subjectId === subjectId) {
            byStudent[mk.studentId] = { score: Number(mk.score) || 0, markId: mk.id || mk.markId };
          }
        });
        setMarks(byStudent);
      } catch (e) {
        setError(e?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [klass, section, examId, subjectId]);

  const rows = useMemo(() => students, [students]);

  function setScore(studentId, value) {
    const v = value === '' ? '' : Number(value);
    if (v === '' || (Number.isFinite(v) && v >= 0 && v <= 100)) {
      setMarks((prev) => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), score: value === '' ? '' : v } }));
    }
  }

  async function save() {
    if (!examId || !subjectId) {
      setError('Please select Exam and Subject.');
      return;
    }
    setSaving(true);
    setError('');
    backupRef.current = marks;
    // optimistic: nothing to change visually since edits already in state
    try {
      const entries = Object.entries(marks)
        .filter(([sid]) => rows.some((s) => s.id === sid))
        .map(([studentId, m]) => ({
          studentId,
          score: Number(m?.score) || 0,
          markId: m?.markId,
        }));
      const payload = { examId, class: String(klass), section: String(section), subjectId, entries };
      const res = await api.academics.upsertMarks(payload);
      // sync markIds if returned
      if (res?.entries) {
        const next = { ...marks };
        res.entries.forEach((e) => {
          if (next[e.studentId]) {
            next[e.studentId].markId = e.markId || next[e.studentId].markId;
          }
        });
        setMarks(next);
      }
    } catch (e) {
      setMarks(backupRef.current || marks);
      setError(e?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  }

  function resetInputs() {
    setMarks({});
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <Card
        title="Marks Entry"
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
            <Select id="subject" label="Subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} style={{ minWidth: 200 }}>
              <option value="">Select Subject</option>
              {(subjects || []).map((s) => (
                <option key={s.id || s.name} value={s.id || s.name}>{s.name}</option>
              ))}
            </Select>
            <Button onClick={save} disabled={saving || loading}>{saving ? 'Saving...' : 'Save'}</Button>
            <Button variant="ghost" onClick={resetInputs}>Reset</Button>
          </div>
        }
      >
        {error && (
          <div className="card" style={{ padding: 12, borderColor: 'var(--color-error)', marginBottom: 12 }}>
            <strong style={{ color: 'var(--color-error)' }}>Error: </strong>
            <span>{error}</span>
          </div>
        )}
        {loading ? (
          <div className="skeleton" style={{ height: 160 }} />
        ) : rows.length === 0 ? (
          <EmptyState title="No students" description="Choose class and section to load students." />
        ) : (
          <div className="card" role="region" aria-label="Marks table">
            <table className="table">
              <thead>
                <tr>
                  <th>Roll #</th>
                  <th>Student</th>
                  <th>Marks (0 - 100)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td>{s.rollNumber || '-'}</td>
                    <td>{s.name}</td>
                    <td>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={marks[s.id]?.score ?? ''}
                        placeholder="0"
                        onChange={(e) => setScore(s.id, e.target.value)}
                        aria-label={`Marks for ${s.name}`}
                        style={{ width: 120 }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
