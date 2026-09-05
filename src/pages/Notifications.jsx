import React, { useState } from 'react';
import { getNotifications, saveEntity, deleteEntity } from '../services/storageService';
import { DataTable, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

function Notifications() {
  const [data, setData] = useState(() => getNotifications());
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const refreshData = () => setData(getNotifications());

  const filteredData = data.filter(n => {
    const matchSearch = !search || n.title?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || n.type === filterType;
    const matchStatus = !filterStatus || n.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleMarkRead = (notif) => {
    saveEntity('df_notifications', { ...notif, status: 'Read' }, false);
    toast.info('Marked as read.');
    refreshData();
  };

  const handleMarkAllRead = () => {
    data.forEach(n => {
      if (n.status === 'Unread') saveEntity('df_notifications', { ...n, status: 'Read' }, false);
    });
    toast.success('All notifications marked as read.');
    refreshData();
  };

  const handleDelete = () => {
    deleteEntity('df_notifications', deleteConfirmId);
    toast.info('Notification deleted.');
    setDeleteConfirmId(null);
    refreshData();
  };

  const totalCount = data.length;
  const unreadCount = data.filter(n => n.status === 'Unread').length;
  const highPriorityCount = data.filter(n => n.priority === 'High' && n.status === 'Unread').length;

  const TYPES = ['Approval', 'Inventory', 'Billing', 'Quotation', 'Order', 'Deal Health', 'System'];

  const columns = [
    { Header: 'Title', accessor: 'title', sortable: true },
    { Header: 'Type', accessor: 'type', sortable: true, Cell: row => <Badge>{row.type}</Badge> },
    { Header: 'Recipient', accessor: 'recipient', sortable: true },
    { Header: 'Priority', accessor: 'priority', sortable: true, Cell: row => <Badge>{row.priority}</Badge> },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status}</Badge> },
    { Header: 'Created', accessor: 'created', sortable: true },
    {
      Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => (
        <div style={{ display: 'flex', gap: '6px' }}>
          {row.status === 'Unread' && <button onClick={() => handleMarkRead(row)} className="btn-table-action edit">Mark Read</button>}
          <button onClick={() => setDeleteConfirmId(row.id)} className="btn-table-action danger">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Manage system-wide alerts, approval triggers, and real-time warnings.</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={handleMarkAllRead}>
            Mark All Read
          </button>
        )}
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL ALERTS</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">System notifications</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">UNREAD</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="metric-value text-warning">{unreadCount}</div>
          <div className="metric-subtitle">Pending attention</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">HIGH PRIORITY</span>
            <svg className="metric-icon text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="metric-value text-danger">{highPriorityCount}</div>
          <div className="metric-subtitle">Urgent alerts</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>Notifications ({filteredData.length})</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notifications…" className="form-input" style={{ width: '200px', height: '32px' }} />
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="form-select" style={{ width: '140px', height: '32px' }}>
              <option value="">All Types</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '130px', height: '32px' }}>
              <option value="">All Statuses</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
          </div>
        </div>
        <DataTable columns={columns} data={filteredData} emptyMessage="No notifications found." />
      </div>

      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Notification" message="Are you sure you want to delete this notification?" />
    </div>
  );
}

export default Notifications;
