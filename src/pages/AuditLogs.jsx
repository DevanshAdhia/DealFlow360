import React, { useState } from 'react';
import { DataTable, Badge } from '../components/common/UI';

const SAMPLE_AUDIT_LOGS = [
  { id: 1, timestamp: '2026-09-06T06:30:00Z', user: 'Super Admin', role: 'Admin', action: 'User Login', entity: 'Auth', description: 'Interactive login session established for Super Admin' },
  { id: 2, timestamp: '2026-09-06T05:28:00Z', user: 'Admin User', role: 'Admin', action: 'Quote Approved', entity: 'Quotations', description: 'Approved enterprise quote Q-1025 for Globex Inc' },
  { id: 3, timestamp: '2026-09-06T04:15:00Z', user: 'Sarah Connor', role: 'Sales Manager', action: 'Quote Created', entity: 'Quotations', description: 'Created quote Q-1024 for Acme Corp' },
  { id: 4, timestamp: '2026-09-05T23:45:00Z', user: 'Mike Ross', role: 'Operations', action: 'Inventory Adjusted', entity: 'Inventory', description: 'Adjusted stock for ProServer X1 (+10 units in Main Hub)' },
  { id: 5, timestamp: '2026-09-05T22:10:00Z', user: 'Jane Smith', role: 'Finance', action: 'Invoice Paid', entity: 'Billing', description: 'Marked invoice INV-2026-003 as Settled/Paid' },
  { id: 6, timestamp: '2026-09-05T21:00:00Z', user: 'Lisa Park', role: 'Operations', action: 'Warehouse Updated', entity: 'Warehouses', description: 'Updated capacity and manager details for North Fulfillment Center' },
  { id: 7, timestamp: '2026-09-05T19:30:00Z', user: 'John Doe', role: 'Sales Representative', action: 'Customer Created', entity: 'Customers', description: 'Onboarded new Enterprise account Stark Industries' },
  { id: 8, timestamp: '2026-09-05T18:15:00Z', user: 'Super Admin', role: 'Admin', action: 'Rule Updated', entity: 'Rules', description: 'Updated Discount Rule ceiling (25%) for Gold Tier Accounts' },
  { id: 9, timestamp: '2026-09-05T16:00:00Z', user: 'David Kim', role: 'Sales Representative', action: 'Product Added', entity: 'Products', description: 'Added SKU-SRV-901 Enterprise Server Blade to active catalog' },
  { id: 10, timestamp: '2026-09-05T14:20:00Z', user: 'Super Admin', role: 'Admin', action: 'Role Modified', entity: 'Roles', description: 'Granted full RBAC Quotations permission to Sales Manager role' },
];

function AuditLogs() {
  const [data] = useState(SAMPLE_AUDIT_LOGS);
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
  const todayLogs = data.filter(l => l.timestamp.startsWith('2026-09-06')).length;
  const uniqueActors = uniqueUsers.length;

  const columns = [
    { Header: 'Timestamp', accessor: 'timestamp', sortable: true, Cell: row => <span style={{ fontSize: '0.8rem', color: '#6b7280', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{formatDate(row.timestamp)}</span> },
    { Header: 'User', accessor: 'user', sortable: true, Cell: row => <strong style={{ color: 'var(--primary)' }}>{row.user}</strong> },
    { Header: 'Role', accessor: 'role', sortable: true, Cell: row => <Badge>{row.role}</Badge> },
    { Header: 'Action', accessor: 'action', sortable: true, Cell: row => <span style={{ fontWeight: '600', color: '#0f172a' }}>{row.action}</span> },
    { Header: 'Entity', accessor: 'entity', sortable: true, Cell: row => <Badge>{row.entity}</Badge> },
    { Header: 'Description', accessor: 'description', sortable: false, Cell: row => <span style={{ fontSize: '0.8125rem', color: '#334155' }}>{row.description}</span> }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Audit Trail & Compliance</h1>
          <p className="page-subtitle">Complete, immutable compliance trail of all administrative events and system actions.</p>
        </div>
        <button onClick={() => window.print()} className="btn btn-primary">Export Log Report</button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL AUDIT LOGS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            </div>
          </div>
          <div className="metric-value text-brand">{totalLogs}</div>
          <div className="metric-subtitle">Recorded system actions</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TODAY'S ACTIVITY</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="metric-value text-success">{todayLogs}</div>
          <div className="metric-subtitle">Events logged today</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">UNIQUE ACTORS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            </div>
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

