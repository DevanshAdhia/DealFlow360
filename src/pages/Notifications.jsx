import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button, Input, Badge, DataTable } from '../components/common/UI';
import { getNotifications, saveEntity } from '../services/storageService';

function Notifications() {
  const [notifications, setNotifications] = useState(() => getNotifications());
  const [search, setSearch] = useState('');
  
  // Safely get context (will be undefined if rendered outside Outlet, but safe here)
  const context = useOutletContext();
  const setUnreadCount = context?.setUnreadCount;

  const filtered = notifications.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleMarkAsRead = (id) => {
    // 1. Update in local storage so it persists
    const target = notifications.find(n => n.id === id);
    if (!target) return;
    
    saveEntity('df_notifications', { ...target, status: 'Read' }, false);
    
    // 2. Update local component state
    const updatedList = getNotifications();
    setNotifications(updatedList);
    
    // 3. Update global header state
    if (setUnreadCount) {
      setUnreadCount(updatedList.filter(n => n.status === 'Unread').length);
    }
  };

  const columns = [
    { Header: 'Date', accessor: 'created', sortable: true, Cell: row => <span style={{ color: 'var(--text-secondary)' }}>{row.created}</span> },
    { Header: 'Type', accessor: 'type', sortable: true },
    { Header: 'Title', accessor: 'title', sortable: true, Cell: row => <span style={{ fontWeight: row.status === 'Unread' ? 600 : 400, color: row.status === 'Unread' ? 'var(--secondary)' : 'inherit' }}>{row.title}</span> },
    { Header: 'Recipient', accessor: 'recipient', sortable: true },
    { Header: 'Priority', accessor: 'priority', sortable: true, Cell: row => <Badge type={row.priority === 'High' ? 'danger' : 'warning'}>{row.priority}</Badge> },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge type={row.status === 'Unread' ? 'warning' : 'default'}>{row.status}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false, Cell: row => (
        row.status === 'Unread' ? <Button variant="secondary" onClick={() => handleMarkAsRead(row.id)} style={{ padding: '0.375rem 0.75rem' }}>Mark as Read</Button> : null
      )
    }
  ];

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
          <DataTable columns={columns} data={filtered} emptyMessage="No notifications." />
        </div>
      </div>
    </div>
  );
}

export default Notifications;
