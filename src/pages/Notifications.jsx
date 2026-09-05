import React, { useState } from 'react';
import { Button, Input, Badge } from '../components/common/UI';
import { getNotifications } from '../services/storageService';

function Notifications() {
  const [notifications] = useState(() => getNotifications());
  const [search, setSearch] = useState('');

  const filtered = notifications.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">System Notifications</h1>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Alerts & Messages</span>
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 0 }} />
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Type</th><th>Title</th><th>Recipient</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(n => (
                  <tr key={n.id}>
                    <td>{n.created}</td>
                    <td>{n.type}</td>
                    <td style={{ fontWeight: n.status === 'Unread' ? 600 : 400 }}>{n.title}</td>
                    <td>{n.recipient}</td>
                    <td><Badge type={n.priority === 'High' ? 'danger' : 'warning'}>{n.priority}</Badge></td>
                    <td><Badge type={n.status === 'Unread' ? 'warning' : 'default'}>{n.status}</Badge></td>
                    <td><Button variant="secondary" style={{padding: '0.25rem 0.5rem'}}>Mark as Read</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
