import React, { useState } from 'react';
import { DataTable } from '../components/common/UI';

function AuditLogs() {
  const [data] = useState([]);
  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');

  const uniqueUsers = [...new Set(data.map(l => l.user))];
  const uniqueActions = [...new Set(data.map(l => l.action))];
  const uniqueEntities = [...new Set(data.map(l => l.entity))];

  const filteredData = data.filter(log => {
    const matchSearch = !search || log.description?.toLowerCase().includes(search.toLowerCase()) || log.user?.toLowerCase().includes(search.toLowerCase());
    const matchUser = !filterUser || log.user === filterUser;
    const matchAction = !filterAction || log.action === filterAction;
    const matchEntity = !filterEntity || log.entity === filterEntity;
    return matchSearch && matchUser && matchAction && matchEntity;
  });

  const formatDate = (ts) => {
    try { return new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return ts; }
  };

  const totalLogs = data.length;
  const todayLogs = data.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length;
  const uniqueActors = uniqueUsers.length;

  const columns = [
    { Header: 'Timestamp', accessor: 'timestamp', sortable: true, Cell: row => <span style={{ fontSize: '0.8rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDate(row.timestamp)}</span> },
    { Header: 'User', accessor: 'user', sortable: true },
    { Header: 'Role', accessor: 'role', sortable: true },
    { Header: 'Action', accessor: 'action', sortable: true },
    { Header: 'Entity', accessor: 'entity', sortable: true },
    { Header: 'Description', accessor: 'description', sortable: false, Cell: row => <span style={{ fontSize: '0.8rem', color: '#374151' }}>{row.description}</span> }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Complete, immutable compliance trail of all administrative events and system actions.</p>
        </div>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL AUDIT LOGS</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="metric-value text-brand">{totalLogs}</div>
          <div className="metric-subtitle">Recorded system actions</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TODAY'S ACTIVITY</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="metric-value text-success">{todayLogs}</div>
          <div className="metric-subtitle">Events logged today</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">UNIQUE ACTORS</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="metric-value text-warning">{uniqueActors}</div>
          <div className="metric-subtitle">Active user accounts</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.875rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>⚠️ Audit logs are <strong>read-only</strong> to enforce enterprise compliance & security auditing protocols.</span>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>Audit Trail ({filteredData.length})</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search log entries…" className="form-input" style={{ width: '180px', height: '32px' }} />
            <select value={filterUser} onChange={e => setFilterUser(e.target.value)} className="form-select" style={{ width: '130px', height: '32px' }}>
              <option value="">All Users</option>
              {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)} className="form-select" style={{ width: '130px', height: '32px' }}>
              <option value="">All Entities</option>
              {uniqueEntities.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="form-select" style={{ width: '130px', height: '32px' }}>
              <option value="">All Actions</option>
              {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <DataTable columns={columns} data={filteredData} emptyMessage="No audit logs found matching your filters." />
      </div>
    </div>
  );
}

export default AuditLogs;
