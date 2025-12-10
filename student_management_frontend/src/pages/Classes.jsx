import React, { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Input, Select } from '../components/Input';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { Table } from '../components/Table';
import { ListSkeleton } from '../components/Skeleton';
import { api } from '../api/client';
import Badge from '../components/Badge';

/**
 * Types (shape hints)
 * Class: { id, name, gradeLevel, description? }
 * Subject: { id, name }
 * Teacher: { id, name }
 * ClassSubject: { id, subjectId, subjectName, teacherId?, teacherName? }
 */

// PUBLIC_INTERFACE
export default function Classes() {
  // List state
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classesError, setClassesError] = useState('');

  // UI filter/search
  const [query, setQuery] = useState('');

  // Add/Edit class modal
  const [openClassModal, setOpenClassModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const [classForm, setClassForm] = useState({ name: '', gradeLevel: '', description: '' });
  const [classErrors, setClassErrors] = useState({});
  const [savingClass, setSavingClass] = useState(false);

  // Delete confirm for class
  const [confirmDeleteClass, setConfirmDeleteClass] = useState(null);

  // Manage Class detail (subjects & teachers)
  const [selectedClass, setSelectedClass] = useState(null); // { id, name, ... }
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]); // for selected class
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  // Add subject to selected class
  const [assignForm, setAssignForm] = useState({ subjectId: '', teacherId: '' });
  const [assignSaving, setAssignSaving] = useState(false);

  const backupRef = useRef(null);

  // Load classes on mount
  useEffect(() => {
    let mounted = true;
    setLoadingClasses(true);
    setClassesError('');
    api.classes
      .listClasses()
      .then((list) => {
        if (!mounted) return;
        const normalized = (Array.isArray(list) ? list : []).map((c, idx) => ({
          id: c.id ?? `cls-${idx + 1}`,
          name: c.name ?? '',
          gradeLevel: c.gradeLevel ?? c.grade ?? '',
          description: c.description ?? '',
        }));
        setClasses(normalized);
      })
      .catch((e) => setClassesError(e?.message || 'Failed to load classes'))
      .finally(() => mounted && setLoadingClasses(false));
    return () => { mounted = false; };
  }, []);

  // Load global subjects and teachers once
  useEffect(() => {
    api.academics.listSubjects().then((s) => {
      const list = (Array.isArray(s) ? s : []).map((x, i) => ({ id: x.id ?? `sub-${i+1}`, name: x.name ?? '' }));
      setSubjects(list);
    }).catch(() => {});
    api.classes.listTeachers().then((t) => {
      const list = (Array.isArray(t) ? t : []).map((x, i) => ({
        id: x.id ?? `t-${i+1}`,
        name: x.name ?? x.fullName ?? x.email ?? `Teacher ${i+1}`,
      }));
      setTeachers(list);
    }).catch(() => {});
  }, []);

  // Open detail drawer/modal by selecting a class
  function openClassDetail(cls) {
    setSelectedClass(cls);
  }

  // When selected class changes, fetch its subject assignments
  useEffect(() => {
    async function loadDetails() {
      if (!selectedClass) return;
      setLoadingDetail(true);
      setDetailError('');
      try {
        const list = await api.classes.listSubjects(selectedClass.id);
        const normalized = (Array.isArray(list) ? list : []).map((s, i) => ({
          id: s.id ?? `cs-${i+1}`,
          subjectId: s.subjectId ?? s.id ?? s.subject?.id ?? `sub-${i+1}`,
          subjectName: s.subjectName ?? s.subject?.name ?? s.name ?? '',
          teacherId: s.teacherId ?? s.teacher?.id ?? '',
          teacherName: s.teacherName ?? s.teacher?.name ?? '',
        }));
        setClassSubjects(normalized);
      } catch (e) {
        setDetailError(e?.message || 'Failed to load class subjects');
      } finally {
        setLoadingDetail(false);
      }
    }
    loadDetails();
  }, [selectedClass]);

  // Derived filtered classes
  const filteredClasses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      String(c.gradeLevel || '').toLowerCase().includes(q)
    );
  }, [classes, query]);

  // Validation
  function validateClassForm(values) {
    const errs = {};
    if (!values.name.trim()) errs.name = 'Class name is required';
    if (!values.gradeLevel.trim()) errs.gradeLevel = 'Grade level is required';
    return errs;
  }

  function openCreateClass() {
    setEditingClassId(null);
    setClassForm({ name: '', gradeLevel: '', description: '' });
    setClassErrors({});
    setOpenClassModal(true);
  }

  function openEditClass(cls) {
    setEditingClassId(cls.id);
    setClassForm({
      name: cls.name || '',
      gradeLevel: String(cls.gradeLevel || ''),
      description: cls.description || '',
    });
    setClassErrors({});
    setOpenClassModal(true);
  }

  async function onSubmitClass(e) {
    e.preventDefault();
    const payload = {
      name: classForm.name.trim(),
      gradeLevel: String(classForm.gradeLevel).trim(),
      description: String(classForm.description || '').trim(),
    };
    const errs = validateClassForm(payload);
    setClassErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingClass(true);
    if (editingClassId) {
      // optimistic update
      backupRef.current = classes;
      const next = classes.map((c) => (c.id === editingClassId ? { ...c, ...payload } : c));
      setClasses(next);
      try {
        await api.classes.updateClass(editingClassId, { id: editingClassId, ...payload });
        setOpenClassModal(false);
      } catch (e) {
        setClasses(backupRef.current || classes);
        setClassesError(e?.message || 'Failed to update class');
        // fallback refetch
        try {
          const list = await api.classes.listClasses();
          const normalized = (Array.isArray(list) ? list : []).map((c, idx) => ({
            id: c.id ?? `cls-${idx + 1}`,
            name: c.name ?? '',
            gradeLevel: c.gradeLevel ?? c.grade ?? '',
            description: c.description ?? '',
          }));
          setClasses(normalized);
        } catch { /* ignore */ }
      } finally {
        setSavingClass(false);
      }
    } else {
      // create optimistic
      const tempId = `tmp-${Date.now()}`;
      const optimistic = { id: tempId, ...payload };
      backupRef.current = classes;
      setClasses([optimistic, ...classes]);
      try {
        const created = await api.classes.createClass(payload);
        setClasses((prev) => prev.map((c) => (c.id === tempId ? { ...c, id: created?.id ?? tempId } : c)));
        setOpenClassModal(false);
      } catch (e) {
        setClasses(backupRef.current || classes);
        setClassesError(e?.message || 'Failed to create class');
        try {
          const list = await api.classes.listClasses();
          const normalized = (Array.isArray(list) ? list : []).map((c, idx) => ({
            id: c.id ?? `cls-${idx + 1}`,
            name: c.name ?? '',
            gradeLevel: c.gradeLevel ?? c.grade ?? '',
            description: c.description ?? '',
          }));
          setClasses(normalized);
        } catch { /* ignore */ }
      } finally {
        setSavingClass(false);
      }
    }
  }

  async function onDeleteClass(cls) {
    setConfirmDeleteClass(null);
    backupRef.current = classes;
    setClasses(classes.filter((c) => c.id !== cls.id));
    try {
      await api.classes.deleteClass(cls.id);
      if (selectedClass?.id === cls.id) {
        setSelectedClass(null);
        setClassSubjects([]);
      }
    } catch (e) {
      setClasses(backupRef.current || classes);
      setClassesError(e?.message || 'Failed to delete class');
      try {
        const list = await api.classes.listClasses();
        const normalized = (Array.isArray(list) ? list : []).map((c, idx) => ({
          id: c.id ?? `cls-${idx + 1}`,
          name: c.name ?? '',
          gradeLevel: c.gradeLevel ?? c.grade ?? '',
          description: c.description ?? '',
        }));
        setClasses(normalized);
      } catch { /* ignore */ }
    }
  }

  async function addSubjectToClass(e) {
    e.preventDefault();
    if (!selectedClass) return;
    const subjectId = assignForm.subjectId;
    const teacherId = assignForm.teacherId || '';
    if (!subjectId) return;

    setAssignSaving(true);
    // optimistic add
    const subject = subjects.find((s) => (s.id || s.name) === subjectId) || { id: subjectId, name: subjectId };
    const teacher = teachers.find((t) => (t.id || t.name) === teacherId);
    const tempId = `csub-${Date.now()}`;
    const optimistic = {
      id: tempId,
      subjectId: subject.id || subjectId,
      subjectName: subject.name || 'Subject',
      teacherId: teacher?.id || '',
      teacherName: teacher?.name || '',
    };
    const backup = classSubjects;
    setClassSubjects([optimistic, ...classSubjects]);
    try {
      const created = await api.classes.assignSubjectToClass(selectedClass.id, { subjectId, teacherId: teacherId || undefined });
      setClassSubjects((prev) =>
        prev.map((cs) => (cs.id === tempId ? {
          ...cs,
          id: created?.id ?? tempId,
          teacherId: created?.teacherId ?? cs.teacherId,
          teacherName: created?.teacherName ?? cs.teacherName,
        } : cs))
      );
      setAssignForm({ subjectId: '', teacherId: '' });
    } catch (e) {
      setClassSubjects(backup);
      setDetailError(e?.message || 'Failed to add subject to class');
    } finally {
      setAssignSaving(false);
    }
  }

  async function removeClassSubject(row) {
    if (!selectedClass) return;
    const backup = classSubjects;
    setClassSubjects(classSubjects.filter((cs) => cs.id !== row.id));
    try {
      await api.classes.deleteSubject(selectedClass.id, row.id);
    } catch (e) {
      setClassSubjects(backup);
      setDetailError(e?.message || 'Failed to remove subject from class');
    }
  }

  async function changeTeacher(row, newTeacherId) {
    if (!selectedClass) return;
    const teacher = teachers.find((t) => (t.id || t.name) === newTeacherId);
    const backup = classSubjects;
    const optimistic = classSubjects.map((cs) =>
      cs.id === row.id ? { ...cs, teacherId: newTeacherId, teacherName: teacher?.name || '' } : cs
    );
    setClassSubjects(optimistic);
    try {
      await api.classes.assignTeacherToSubjectInClass(selectedClass.id, row.id, newTeacherId || null);
    } catch (e) {
      setClassSubjects(backup);
      setDetailError(e?.message || 'Failed to assign teacher');
    }
  }

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Grade Level', accessor: 'gradeLevel' },
    { header: 'Description', accessor: 'description', cell: (r) => r.description || '-' },
  ];

  return (
    <div className="grid" style={{ gap: 16 }}>
      <Card
        title="Classes"
        headerRight={
          <div className="row" style={{ alignItems: 'flex-end' }}>
            <Input id="q" label="Search" placeholder="Search by name or grade" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button onClick={openCreateClass}>+ Create Class</Button>
          </div>
        }
      >
        {classesError && (
          <div className="card" style={{ padding: 12, borderColor: 'var(--color-error)', marginBottom: 12 }}>
            <strong style={{ color: 'var(--color-error)' }}>Error: </strong>
            <span>{classesError}</span>
          </div>
        )}
        {loadingClasses ? (
          <ListSkeleton rows={6} />
        ) : filteredClasses.length === 0 ? (
          <EmptyState title="No classes" description="Create your first class to start organizing subjects and teachers." actionLabel="Create Class" onAction={openCreateClass} />
        ) : (
          <Table
            columns={columns}
            data={filteredClasses}
            rowKey="id"
            actions={(row) => (
              <div className="row">
                <Button variant="ghost" onClick={() => openClassDetail(row)}>Manage</Button>
                <Button variant="ghost" onClick={() => openEditClass(row)}>Edit</Button>
                <Button variant="ghost" onClick={() => setConfirmDeleteClass(row)}>Delete</Button>
              </div>
            )}
          />
        )}
      </Card>

      {/* Manage Class detail: subjects & teachers */}
      {selectedClass && (
        <Card
          title={
            <span>
              Class Detail: <span style={{ fontWeight: 800 }}>{selectedClass.name}</span>{' '}
              <Badge tone="info" style={{ marginLeft: 8 }}>Grade {selectedClass.gradeLevel}</Badge>
            </span>
          }
          headerRight={
            <Button variant="ghost" onClick={() => { setSelectedClass(null); setClassSubjects([]); }}>Close</Button>
          }
        >
          {detailError && (
            <div className="card" style={{ padding: 12, borderColor: 'var(--color-error)', marginBottom: 12 }}>
              <strong style={{ color: 'var(--color-error)' }}>Error: </strong>
              <span>{detailError}</span>
            </div>
          )}
          <div className="grid" style={{ gap: 12 }}>
            <form onSubmit={addSubjectToClass} className="row" style={{ alignItems: 'flex-end' }}>
              <Select id="subjectId" label="Add Subject" value={assignForm.subjectId} onChange={(e) => setAssignForm((f) => ({ ...f, subjectId: e.target.value }))} style={{ minWidth: 220 }}>
                <option value="">Select Subject</option>
                {(subjects || []).map((s) => (
                  <option key={s.id || s.name} value={s.id || s.name}>{s.name}</option>
                ))}
              </Select>
              <Select id="teacherId" label="Assign Teacher (optional)" value={assignForm.teacherId} onChange={(e) => setAssignForm((f) => ({ ...f, teacherId: e.target.value }))} style={{ minWidth: 220 }}>
                <option value="">Unassigned</option>
                {(teachers || []).map((t) => (
                  <option key={t.id || t.name} value={t.id || t.name}>{t.name}</option>
                ))}
              </Select>
              <Button type="submit" disabled={assignSaving || !assignForm.subjectId}>{assignSaving ? 'Adding...' : 'Add Subject'}</Button>
            </form>

            {loadingDetail ? (
              <div className="skeleton" style={{ height: 140 }} />
            ) : classSubjects.length === 0 ? (
              <EmptyState title="No subjects in this class" description="Add subjects to this class and optionally assign a teacher." />
            ) : (
              <div className="card" role="region" aria-label="Class subjects table">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Teacher</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classSubjects.map((cs) => (
                      <tr key={cs.id}>
                        <td>{cs.subjectName || cs.subjectId}</td>
                        <td style={{ minWidth: 260 }}>
                          <select
                            className="select"
                            value={cs.teacherId || ''}
                            onChange={(e) => changeTeacher(cs, e.target.value)}
                          >
                            <option value="">Unassigned</option>
                            {(teachers || []).map((t) => (
                              <option key={t.id || t.name} value={t.id || t.name}>{t.name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="row">
                            <Button variant="ghost" onClick={() => removeClassSubject(cs)}>Remove</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Create/Edit Class Modal */}
      <Modal open={openClassModal} title={editingClassId ? 'Edit Class' : 'Create Class'} onClose={() => setOpenClassModal(false)} footer={null}>
        <form onSubmit={onSubmitClass} style={{ display: 'grid', gap: 12 }}>
          <Input
            id="name"
            label="Class Name"
            value={classForm.name}
            onChange={(e) => setClassForm((f) => ({ ...f, name: e.target.value }))}
            required
            aria-invalid={!!classErrors.name}
          />
          {classErrors.name && <div style={{ color: 'var(--color-error)', fontSize: 12 }}>{classErrors.name}</div>}

          <Input
            id="gradeLevel"
            label="Grade Level"
            value={classForm.gradeLevel}
            onChange={(e) => setClassForm((f) => ({ ...f, gradeLevel: e.target.value }))}
            required
            aria-invalid={!!classErrors.gradeLevel}
          />
          {classErrors.gradeLevel && <div style={{ color: 'var(--color-error)', fontSize: 12 }}>{classErrors.gradeLevel}</div>}

          <Input
            id="description"
            label="Description (optional)"
            value={classForm.description}
            onChange={(e) => setClassForm((f) => ({ ...f, description: e.target.value }))}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <Button variant="ghost" type="button" onClick={() => setOpenClassModal(false)}>Cancel</Button>
            <Button type="submit" disabled={savingClass}>{savingClass ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete class modal */}
      <Modal open={!!confirmDeleteClass} title="Delete Class" onClose={() => setConfirmDeleteClass(null)} footer={null}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>Are you sure you want to delete <strong>{confirmDeleteClass?.name}</strong>?</div>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setConfirmDeleteClass(null)}>Cancel</Button>
            <Button onClick={() => onDeleteClass(confirmDeleteClass)}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
