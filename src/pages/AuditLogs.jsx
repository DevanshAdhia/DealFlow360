import React, { useState } from 'react';
import { getAuditLogs } from '../services/storageService';
import { Input, Badge } from '../components/common/UI';

function AuditLogs() {
  const [logs] = useState(() => getAuditLogs());
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l => 
    l.user.toLowerCase().includes(search.toLowerCase()) || 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Audit Logs</h1>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>System Activity Log</span>
          <Input 
            placeholder="Search logs..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ marginBottom: 0, width: '250px' }}
          />
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => {
                  const date = new Date(log.timestamp);
                  return (
                    <tr key={log.id}>
                      <td style={{ color: 'var(--text-secondary)' }}>{date.toLocaleString()}</td>
                      <td style={{ fontWeight: 500 }}>{log.user}</td>
                      <td><Badge type="default">{log.role}</Badge></td>
                      <td><strong>{log.action}</strong></td>
                      <td><Badge type="info">{log.entity}</Badge></td>
                      <td>{log.description}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No logs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;
