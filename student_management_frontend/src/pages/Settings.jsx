import React from 'react';
import Card from '../components/Card';
import { config } from '../config';

// PUBLIC_INTERFACE
export default function Settings() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <Card title="Application Settings">
        <div style={{ display: 'grid', gap: 10 }}>
          <div><strong>Environment:</strong> {config.nodeEnv}</div>
          <div><strong>API Base URL:</strong> {config.baseUrl || 'Not configured (client-only mode)'}</div>
          <div><strong>Health Path:</strong> {config.healthPath}</div>
        </div>
      </Card>
      <Card title="About">
        <p style={{ margin: 0 }}>This is a placeholder settings page. Wire this to your backend when available.</p>
      </Card>
    </div>
  );
}
