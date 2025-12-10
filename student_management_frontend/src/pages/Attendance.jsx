import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Input, Select } from '../components/Input';
import Badge from '../components/Badge';
import { Table } from '../components/Table';

const students = [
  { id: 'S-1001', name: 'John Carter', class: '10A' },
  { id: 'S-1002', name: 'Jane Doe', class: '10A' },
  { id: 'S-1003', name: 'Mark Lee', class: '10A' },
];

// PUBLIC_INTERFACE
export default function Attendance() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [section, setSection] = useState('10A');
  const [status, setStatus] = useState(() => Object.fromEntries(students.map(s => [s.id, true])));
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => students.filter(s => s.class === section), [section]);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Class', accessor: 'class' },
    { header: 'Status', accessor: 'att', cell: (r) => <Badge tone={status[r.id] ? 'success' : 'error'}>{status[r.id] ? 'Present' : 'Absent'}</Badge> },
  ];

  function toggle(id) {
    setStatus(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function save() {
    setSaving(true);
    // Placeholder to simulate save
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    alert('Attendance saved (client-only).');
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <Card
        title="Attendance"
        headerRight={
          <div className="row" style={{ alignItems: 'flex-end' }}>
            <Input id="date" label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 180 }} />
            <Select id="section" label="Class/Section" value={section} onChange={(e) => setSection(e.target.value)} style={{ width: 180 }}>
              <option value="10A">10A</option>
              <option value="10B">10B</option>
              <option value="9C">9C</option>
            </Select>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        }
      >
        <Table
          columns={columns}
          data={filtered}
          rowKey="id"
          actions={(row) => (
            <Button variant="ghost" onClick={() => toggle(row.id)}>
              Toggle
            </Button>
          )}
        />
      </Card>
    </div>
  );
}
