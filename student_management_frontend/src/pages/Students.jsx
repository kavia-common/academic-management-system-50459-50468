import React, { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Input, Select } from '../components/Input';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { Table } from '../components/Table';
import EmptyState from '../components/EmptyState';
import { ListSkeleton } from '../components/Skeleton';
import { api } from '../api/client';

// PUBLIC_INTERFACE
export default function Students() {
  // Local list state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name | class | section | rollNumber
  const [sortDir, setSortDir] = useState('asc'); // asc | desc

  // Modal state for Add/Edit
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const initialForm = { name: '', email: '', class: '', section: '', rollNumber: '' };
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete confirm modal
  const [confirmDelete, setConfirmDelete] = useState(null);
  const optimisticBackupRef = useRef(null);

  // Columns definition: searchable/sortable by name, class, section, rollNumber
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email', cell: (r) => r.email || '-' },
    { header: 'Class', accessor: 'class' },
    { header: 'Section', accessor: 'section' },
    { header: 'Roll #', accessor: 'rollNumber' },
    { header: 'Status', accessor: 'status', cell: (r) => <Badge tone={r.status === 'Active' ? 'success' : 'warning'}>{r.status || 'Active'}</Badge> },
  ];

  // Load students on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    api.students
      .listStudents()
      .then((list) => {
        if (!mounted) return;
        // Normalize list to expected fields
        const normalized = (Array.isArray(list) ? list : []).map((s, idx) => ({
          id: s.id ?? `tmp-${idx + 1}`,
          name: s.name ?? '',
          email: s.email ?? '',
          class: s.class ?? '',
          section: s.section ?? '',
          rollNumber: s.rollNumber ?? '',
          status: s.status ?? 'Active',
        }));
        setRows(normalized);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || 'Failed to load students');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Derived list based on search and sort
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows;
    if (q) {
      out = out.filter((r) => {
        return (
          r.name.toLowerCase().includes(q) ||
          (r.class || '').toLowerCase().includes(q) ||
          (r.section || '').toLowerCase().includes(q) ||
          String(r.rollNumber || '').toLowerCase().includes(q)
        );
      });
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    out = [...out].sort((a, b) => {
      const va = String(a[sortBy] ?? '').toLowerCase();
      const vb = String(b[sortBy] ?? '').toLowerCase();
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }, [rows, query, sortBy, sortDir]);

  function resetForm() {
    setForm(initialForm);
    setFormErrors({});
    setIsEdit(false);
    setEditingId(null);
  }

  function openAdd() {
    resetForm();
    setOpenModal(true);
  }

  function openEdit(row) {
    setIsEdit(true);
    setEditingId(row.id);
    setForm({
      name: row.name || '',
      email: row.email || '',
      class: row.class || '',
      section: row.section || '',
      rollNumber: String(row.rollNumber ?? ''),
    });
    setFormErrors({});
    setOpenModal(true);
  }

  // UI validation incl. unique rollNumber within class+section
  function validateForm(values) {
    const errs = {};
    if (!values.name.trim()) errs.name = 'Name is required';
    if (!values.class.trim()) errs.class = 'Class is required';
    if (!values.section.trim()) errs.section = 'Section is required';
    if (!String(values.rollNumber).trim()) errs.rollNumber = 'Roll number is required';
    // Basic email format check if provided
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) {
      errs.email = 'Invalid email';
    }
    // Unique rollNumber within class+section
    const candidateKey = `${values.class.trim()}::${values.section.trim()}::${String(values.rollNumber).trim()}`;
    const exists = rows.some((r) => {
      const rowKey = `${String(r.class || '').trim()}::${String(r.section || '').trim()}::${String(r.rollNumber || '').trim()}`;
      if (isEdit && r.id === editingId) return false;
      return rowKey === candidateKey;
    });
    if (exists) {
      errs.rollNumber = 'Roll number must be unique within Class + Section';
    }
    return errs;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      class: form.class.trim(),
      section: form.section.trim(),
      rollNumber: String(form.rollNumber).trim(),
      status: 'Active',
    };
    const errs = validateForm(payload);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setError('');

    if (isEdit) {
      // Optimistic update
      optimisticBackupRef.current = rows;
      const nextRows = rows.map((r) => (r.id === editingId ? { ...r, ...payload } : r));
      setRows(nextRows);

      try {
        await api.students.updateStudent(editingId, { id: editingId, ...payload });
        setOpenModal(false);
        resetForm();
      } catch (e1) {
        // rollback and refetch fallback
        setRows(optimisticBackupRef.current || rows);
        setError(e1?.message || 'Failed to update student');
        try {
          const refreshed = await api.students.listStudents();
          const normalized = (Array.isArray(refreshed) ? refreshed : []).map((s, idx) => ({
            id: s.id ?? `tmp-${idx + 1}`,
            name: s.name ?? '',
            email: s.email ?? '',
            class: s.class ?? '',
            section: s.section ?? '',
            rollNumber: s.rollNumber ?? '',
            status: s.status ?? 'Active',
          }));
          setRows(normalized);
        } catch {
          // ignore
        }
      } finally {
        setSaving(false);
      }
    } else {
      // Create - optimistic add with temp id
      const tempId = `tmp-${Date.now()}`;
      const optimistic = { id: tempId, ...payload };
      optimisticBackupRef.current = rows;
      setRows([optimistic, ...rows]);

      try {
        const created = await api.students.createStudent(payload);
        // Replace temp with real id if provided
        setRows((prev) =>
          prev.map((r) => (r.id === tempId ? { ...optimistic, id: created?.id ?? tempId } : r))
        );
        setOpenModal(false);
        resetForm();
      } catch (e2) {
        setRows(optimisticBackupRef.current || rows);
        setError(e2?.message || 'Failed to create student');
        try {
          const refreshed = await api.students.listStudents();
          const normalized = (Array.isArray(refreshed) ? refreshed : []).map((s, idx) => ({
            id: s.id ?? `tmp-${idx + 1}`,
            name: s.name ?? '',
            email: s.email ?? '',
            class: s.class ?? '',
            section: s.section ?? '',
            rollNumber: s.rollNumber ?? '',
            status: s.status ?? 'Active',
          }));
          setRows(normalized);
        } catch {
          // ignore
        }
      } finally {
        setSaving(false);
      }
    }
  }

  async function onDelete(row) {
    setConfirmDelete(null);
    // Optimistic delete
    optimisticBackupRef.current = rows;
    setRows(rows.filter((r) => r.id !== row.id));
    try {
      await api.students.deleteStudent(row.id);
    } catch (e3) {
      setRows(optimisticBackupRef.current || rows);
      setError(e3?.message || 'Failed to delete student');
      try {
        const refreshed = await api.students.listStudents();
        const normalized = (Array.isArray(refreshed) ? refreshed : []).map((s, idx) => ({
          id: s.id ?? `tmp-${idx + 1}`,
          name: s.name ?? '',
          email: s.email ?? '',
          class: s.class ?? '',
          section: s.section ?? '',
          rollNumber: s.rollNumber ?? '',
          status: s.status ?? 'Active',
        }));
        setRows(normalized);
      } catch {
        // ignore
      }
    }
  }

  function sortToggle(next) {
    if (sortBy !== next) {
      setSortBy(next);
      setSortDir('asc');
    } else {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    }
  }

  const sortLabel = (field, label) => (
    <button
      type="button"
      className="btn ghost"
      style={{ padding: '6px 10px', fontSize: 12 }}
      onClick={() => sortToggle(field)}
      aria-label={`Sort by ${label}`}
      title={`Sort by ${label}`}
    >
      {label} {sortBy === field ? (sortDir === 'asc' ? '▲' : '▼') : ''}
    </button>
  );

  return (
    <div className="grid" style={{ gap: 16 }}>
      <Card
        title="Students"
        headerRight={
          <div className="row" style={{ alignItems: 'flex-end' }}>
            <Input
              id="search"
              label="Search"
              placeholder="Search by name, class, section or roll #"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ minWidth: 260 }}
            />
            <Select
              id="sort"
              label="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 180 }}
            >
              <option value="name">Name</option>
              <option value="class">Class</option>
              <option value="section">Section</option>
              <option value="rollNumber">Roll Number</option>
            </Select>
            <Button onClick={openAdd}>+ Add Student</Button>
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
          <ListSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No students"
            description="Add your first student to get started."
            actionLabel="Add Student"
            onAction={openAdd}
          />
        ) : (
          <div className="card" role="region" aria-label="Students table">
            <table className="table">
              <thead>
                <tr>
                  <th>{sortLabel('name', 'Name')}</th>
                  <th>Email</th>
                  <th>{sortLabel('class', 'Class')}</th>
                  <th>{sortLabel('section', 'Section')}</th>
                  <th>{sortLabel('rollNumber', 'Roll #')}</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.email || '-'}</td>
                    <td>{row.class}</td>
                    <td>{row.section}</td>
                    <td>{row.rollNumber}</td>
                    <td><Badge tone={row.status === 'Active' ? 'success' : 'warning'}>{row.status || 'Active'}</Badge></td>
                    <td>
                      <div className="row">
                        <Button variant="ghost" onClick={() => openEdit(row)}>Edit</Button>
                        <Button variant="ghost" onClick={() => setConfirmDelete(row)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal open={openModal} title={isEdit ? 'Edit Student' : 'Add Student'} onClose={() => setOpenModal(false)} footer={null}>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <Input
            id="name"
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            aria-invalid={!!formErrors.name}
            aria-describedby={formErrors.name ? 'err-name' : undefined}
          />
          {formErrors.name && <div id="err-name" style={{ color: 'var(--color-error)', fontSize: 12 }}>{formErrors.name}</div>}

          <Input
            id="email"
            label="Email (optional)"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            aria-invalid={!!formErrors.email}
            aria-describedby={formErrors.email ? 'err-email' : undefined}
          />
          {formErrors.email && <div id="err-email" style={{ color: 'var(--color-error)', fontSize: 12 }}>{formErrors.email}</div>}

          <div className="row" style={{ width: '100%' }}>
            <Input
              id="class"
              label="Class"
              value={form.class}
              onChange={(e) => setForm((f) => ({ ...f, class: e.target.value }))}
              required
              aria-invalid={!!formErrors.class}
              aria-describedby={formErrors.class ? 'err-class' : undefined}
              style={{ flex: 1, minWidth: 140 }}
            />
            <Input
              id="section"
              label="Section"
              value={form.section}
              onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
              required
              aria-invalid={!!formErrors.section}
              aria-describedby={formErrors.section ? 'err-section' : undefined}
              style={{ flex: 1, minWidth: 140 }}
            />
          </div>
          {(formErrors.class || formErrors.section) && (
            <div style={{ color: 'var(--color-error)', fontSize: 12 }}>
              {formErrors.class || formErrors.section}
            </div>
          )}

          <Input
            id="rollNumber"
            label="Roll Number"
            value={form.rollNumber}
            onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))}
            required
            aria-invalid={!!formErrors.rollNumber}
            aria-describedby={formErrors.rollNumber ? 'err-roll' : undefined}
          />
          {formErrors.rollNumber && <div id="err-roll" style={{ color: 'var(--color-error)', fontSize: 12 }}>{formErrors.rollNumber}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <Button variant="ghost" type="button" onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={!!confirmDelete}
        title="Delete Student"
        onClose={() => setConfirmDelete(null)}
        footer={null}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div>Are you sure you want to delete <strong>{confirmDelete?.name}</strong>?</div>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button onClick={() => onDelete(confirmDelete)}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
