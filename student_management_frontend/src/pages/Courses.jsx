import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Input } from '../components/Input';
import Modal from '../components/Modal';
import { Table } from '../components/Table';
import EmptyState from '../components/EmptyState';

const initialCourses = [
  { code: 'CS101', title: 'Intro to CS', instructor: 'Dr. Smith', enrolled: 45 },
  { code: 'MA201', title: 'Linear Algebra', instructor: 'Prof. Johnson', enrolled: 38 },
];

// PUBLIC_INTERFACE
export default function Courses() {
  const [rows, setRows] = useState(initialCourses);
  const [query, setQuery] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({ code: '', title: '', instructor: '', enrolled: 0 });

  const columns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Title', accessor: 'title' },
    { header: 'Instructor', accessor: 'instructor' },
    { header: 'Enrolled', accessor: 'enrolled' },
  ];

  const filtered = useMemo(() => {
    return rows.filter(r =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.code.toLowerCase().includes(query.toLowerCase())
    );
  }, [rows, query]);

  function onSubmit(e) {
    e.preventDefault();
    if (!form.code || !form.title) return;
    setRows(prev => [{ ...form, enrolled: Number(form.enrolled) || 0 }, ...prev]);
    setForm({ code: '', title: '', instructor: '', enrolled: 0 });
    setOpenModal(false);
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <Card
        title="Courses"
        headerRight={
          <div className="row" style={{ alignItems: 'flex-end' }}>
            <Input id="csearch" label="Search" placeholder="Search by title or code" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button onClick={() => setOpenModal(true)}>+ Add Course</Button>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState title="No courses" description="Add your first course to get started." actionLabel="Add Course" onAction={() => setOpenModal(true)} />
        ) : (
          <Table
            columns={columns}
            data={filtered}
            rowKey="code"
            actions={(row) => (
              <div className="row">
                <Button variant="ghost" onClick={() => alert(`Edit ${row.title}`)}>Edit</Button>
                <Button variant="ghost" onClick={() => setRows(prev => prev.filter(r => r.code !== row.code))}>Delete</Button>
              </div>
            )}
          />
        )}
      </Card>

      <Modal open={openModal} title="Add Course" onClose={() => setOpenModal(false)} footer={null}>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <Input id="code" label="Course Code" value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))} required />
          <Input id="title" label="Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required />
          <Input id="instructor" label="Instructor" value={form.instructor} onChange={(e) => setForm(f => ({ ...f, instructor: e.target.value }))} />
          <Input id="enrolled" label="Enrolled" type="number" min="0" value={form.enrolled} onChange={(e) => setForm(f => ({ ...f, enrolled: e.target.value }))} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <Button variant="ghost" type="button" onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
