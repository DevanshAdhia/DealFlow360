import React, { useState } from 'react';
import { Input, DataTable } from '../components/common/UI';
import { getAuditLogs } from '../services/storageService';

function AuditLogs() {
  const [logs] = useState(() => getAuditLogs());
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) || 
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.entity.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { Header: 'Timestamp', accessor: 'timestamp', sortable: true, Cell: row => <span style={{ color: 'var(--text-secondary)' }}>{row.timestamp}</span> },
    { Header: 'User', accessor: 'user', sortable: true, Cell: row => <strong style={{fontWeight: 600, color: 'var(--secondary)'}}>{row.user}</strong> },
    { Header: 'Role', accessor: 'role', sortable: true },
    { Header: 'Action', accessor: 'action', sortable: true, Cell: row => <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{row.action}</span> },
    { Header: 'Entity', accessor: 'entity', sortable: true },
    { Header: 'Entity ID', accessor: 'entityId', sortable: true },
    { Header: 'Description', accessor: 'description', sortable: false }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">System Audit Logs</h1>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Immutable Activity Trail</span>
          <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 0, width: '300px' }} />
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <DataTable columns={columns} data={filtered} emptyMessage="No audit logs recorded." />
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;
