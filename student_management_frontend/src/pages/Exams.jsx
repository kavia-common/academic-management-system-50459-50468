import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Input, Select } from '../components/Input';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { Table } from '../components/Table';
import { api } from '../api/client';

// PUBLIC_INTERFACE
export default function Exams() {
  /** Exams list and CRUD (client-only friendly). */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', term: 'Term 1', startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    api.academics
      .listExams()
      .then((list) => {
        if (!mounted) return;
        const normalized = (Array.isArray(list) ? list : []).map((e, i) => ({
          id: e.id ?? `exam-${i + 1}`,
          name: e.name ?? '',
          term: e.term ?? e.semester ?? 'Term 1',
          startDate: e.startDate ?? e.from ?? '',
          endDate: e.endDate ?? e.to ?? '',
        }));
        setRows(normalized);
      })
      .catch((e) => setError(e?.message || 'Failed to load exams'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q) || String(r.term).toLowerCase().includes(q));
  }, [rows, query]);

  function openCreate() {
    setEditingId(null);
    setForm({ name: '', term: 'Term 1', startDate: '', endDate: '' });
    setOpen(true);
  }

  function openEdit(row) {
    setEditingId(row.id);
    setForm({ name: row.name, term: row.term || 'Term 1', startDate: row.startDate || '', endDate: row.endDate || '' });
    setOpen(true);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const payload = { name: form.name.trim(), term: form.term, startDate: form.startDate, endDate: form.endDate };
    if (!payload.name) return;
    setSaving(true);
    try {
      if (editingId) {
        const optimistic = rows.map((r) => (r.id === editingId ? { ...r, ...payload } : r));
        const backup = rows;
        setRows(optimistic);
        try {
          await api.academics.updateExam(editingId, { id: editingId, ...payload });
        } catch (e) {
          setRows(backup);
          setError(e?.message || 'Failed to update exam');
        }
      } else {
        const tempId = `tmp-${Date.now()}`;
        const optimistic = [{ id: tempId, ...payload }, ...rows];
        const backup = rows;
        setRows(optimistic);
        try {
          const created = await api.academics.createExam(payload);
          setRows((prev) => prev.map((r) => (r.id === tempId ? { ...r, id: created?.id ?? tempId } : r)));
        } catch (e) {
          setRows(backup);
          setError(e?.message || 'Failed to create exam');
        }
      }
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(row) {
    setConfirmDelete(null);
    const backup = rows;
    setRows(rows.filter((r) => r.id !== row.id));
    try {
      await api.academics.deleteExam(row.id);
    } catch (e) {
      setRows(backup);
      setError(e?.message || 'Failed to delete exam');
    }
  }

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Term/Semester', accessor: 'term' },
    { header: 'Start', accessor: 'startDate' },
    { header: 'End', accessor: 'endDate' },
  ];

  return (
    <div className="grid" style={{ gap: 16 }}>
      <Card
        title="Exams"
        headerRight={
          <div className="row" style={{ alignItems: 'flex-end' }}>
            <Input id="q" label="Search" placeholder="Search exams" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button onClick={openCreate}>+ Create Exam</Button>
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
          <div className="skeleton" style={{ height: 120 }} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No exams" description="Create your first exam to start recording marks." actionLabel="Create Exam" onAction={openCreate} />
        ) : (
          <Table
            columns={columns}
            data={filtered}
            rowKey="id"
            actions={(row) => (
              <div className="row">
                <Button variant="ghost" onClick={() => openEdit(row)}>Edit</Button>
                <Button variant="ghost" onClick={() => setConfirmDelete(row)}>Delete</Button>
              </div>
            )}
          />
        )}
      </Card>

      <Modal open={open} title={editingId ? 'Edit Exam' : 'Create Exam'} onClose={() => setOpen(false)} footer={null}>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <Input id="name" label="Exam Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Select id="term" label="Term/Semester" value={form.term} onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}>
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 2">Semester 2</option>
          </Select>
          <div className="row" style={{ width: '100%' }}>
            <Input id="startDate" label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            <Input id="endDate" label="End Date" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!confirmDelete} title="Delete Exam" onClose={() => setConfirmDelete(null)} footer={null}>
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
