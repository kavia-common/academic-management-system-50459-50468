import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import { api } from '../api/client';

// PUBLIC_INTERFACE
export default function Dashboard() {
  const [health, setHealth] = useState({ loading: true });

  useEffect(() => {
    let mounted = true;
    api.healthCheck().then((res) => { if (mounted) setHealth({ loading: false, res }); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="grid cols-4">
        <StatCard label="Total Students" value="1,245" trend={4.2} />
        <StatCard label="Active Courses" value="32" trend={1.8} />
        <StatCard label="Avg. Attendance" value="92%" trend={-0.4} />
        <StatCard label="Pending Tasks" value="7" />
      </div>
      <div className="grid cols-2" style={{ marginTop: 16 }}>
        <Card title="Recent Activity">
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            <li>New student registered - Jane Doe</li>
            <li>Attendance submitted for Class 10A</li>
            <li>Course CS101 updated syllabus</li>
          </ul>
        </Card>
        <Card title="System Health">
          {health.loading ? <div className="skeleton" style={{ height: 18, width: 200 }} /> : (
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {JSON.stringify(health.res, null, 2)}
            </pre>
          )}
        </Card>
      </div>
    </div>
  );
}
