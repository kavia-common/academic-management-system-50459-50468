import React from 'react';

// PUBLIC_INTERFACE
export function Table({ columns = [], data = [], rowKey = 'id', actions }) {
  return (
    <div className="card" role="region" aria-label="table">
      <table className="table">
        <thead>
          <tr>
            {columns.map(col => <th key={col.key || col.accessor}>{col.header}</th>)}
            {actions ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row[rowKey] ?? JSON.stringify(row)}>
              {columns.map(col => (
                <td key={col.key || col.accessor}>
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
              {actions ? <td>{actions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
