import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Input, Select } from '../components/Input';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { Table } from '../components/Table';
import EmptyState from '../components/EmptyState';
import { ListSkeleton } from '../components/Skeleton';

const initialRows = [
  { id: 'S-1001', name: 'John Carter', class: '10A', status: 'Active' },
  { id: 'S-1002', name: 'Jane Doe', class: '10B', status: 'Active' },
  { id: 'S-1003', name: 'Mark Lee', class: '9C', status: 'Inactive' },
];

// PUBLIC_INTERFACE
export default function Students() {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({ id: '', name: '', class: '', status: 'Active' });

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Class', accessor: 'class' },
    { header: 'Status', accessor: 'status', cell: (r) => <Badge tone={r.status === 'Active' ? 'success' : 'warning'}>{r.status}</Badge> },
  ];

  const filtered = useMemo(() => {
    let out = rows.filter(r => r.name.toLowerCase().includes(query.toLowerCase()) || r.id.toLowerCase().includes(query.toLowerCase()));
    if (statusFilter !== 'all') out = out.filter(r => r.status === statusFilter);
    out.sort((a, b) => String(a[sortBy]).localeCompare(String(b[sortBy])));
    return out;
  }, [rows, query, statusFilter, sortBy]);

  function onSubmit(e) {
    e.preventDefault();
    if (!form.id || !form.name) return;
    setRows(prev => [{ ...form }, ...prev]);
    setForm({ id: '', name: '', class: '', status: 'Active' });
    setOpenModal(false);
  }

  function removeRow(id) {
    setRows(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <Card
        title="Students"
        headerRight={
          <div className="row" style={{ alignItems: 'center' }}>
            <Input id="search" label="Search" placeholder="Search by name or ID" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Select id="status" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 160 }}>
              <option value="all">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
            <Select id="sort" label="Sort by" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: 160 }}>
              <option value="name">Name</option>
              <option value="id">ID</option>
              <option value="class">Class</option>
            </Select>
            <Button onClick={() => setOpenModal(true)}>+ Add Student</Button>
          </div>
        }
      >
        {loading ? <ListSkeleton rows={5} /> : (
          filtered.length === 0 ? (
            <EmptyState title="No students found" description="Try adjusting your search or filters." actionLabel="Add Student" onAction={() => setOpenModal(true)} />
          ) : (
            <Table
              columns={columns}
              data={filtered}
              rowKey="id"
              actions={(row) => (
                <div className="row">
                  <Button variant="ghost" onClick={() => alert(`View ${row.name}`)}>View</Button>
                  <Button variant="ghost" onClick={() => alert(`Edit ${row.name}`)}>Edit</Button>
                  <Button variant="ghost" onClick={() => removeRow(row.id)}>Delete</Button>
                </div>
              )}
            />
          )
        )}
      </Card>

      <Modal open={openModal} title="Add Student" onClose={() => setOpenModal(false)} footer={null}>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <Input id="sid" label="Student ID" value={form.id} onChange={(e) => setForm(f => ({ ...f, id: e.target.value }))} required />
          <Input id="sname" label="Full Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input id="sclass" label="Class/Section" value={form.class} onChange={(e) => setForm(f => ({ ...f, class: e.target.value }))} />
          <Select id="sstatus" label="Status" value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <Button variant="ghost" type="button" onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
