import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../services/apiService';
import { DataTable, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'Quotation Q-1025 requires Vice President approval (Discount 22.5%)', alert_type: 'Approval', type: 'Approval', priority: 'High', severity: 'HIGH', status: 'Unread', is_resolved: false, recipient: 'Sales Manager', created: '10 mins ago', created_at: '2026-09-06T06:50:00Z' },
  { id: 2, title: 'Critical Low Stock: Storage Array 100TB reaching 0 units in South Regional Logistics', alert_type: 'Inventory', type: 'Inventory', priority: 'High', severity: 'HIGH', status: 'Unread', is_resolved: false, recipient: 'Operations Lead', created: '35 mins ago', created_at: '2026-09-06T06:25:00Z' },
  { id: 3, title: 'Invoice INV-2026-002 is past due date (Overdue by 7 days — ₹8.4L)', alert_type: 'Billing', type: 'Billing', priority: 'Medium', severity: 'MEDIUM', status: 'Unread', is_resolved: false, recipient: 'Finance Team', created: '2 hours ago', created_at: '2026-09-06T05:00:00Z' },
  { id: 4, title: 'New Customer Account Onboarded: Stark Industries (Enterprise Tier)', alert_type: 'Customer', type: 'Customer', priority: 'Low', severity: 'LOW', status: 'Read', is_resolved: true, recipient: 'System Admin', created: 'Yesterday', created_at: '2026-09-05T18:00:00Z' },
  { id: 5, title: 'Order ORD-2026-003 status updated to Partially Fulfilled', alert_type: 'Order', type: 'Order', priority: 'Low', severity: 'LOW', status: 'Read', is_resolved: true, recipient: 'Fulfillment Team', created: 'Yesterday', created_at: '2026-09-05T14:30:00Z' },
  { id: 6, title: 'Discount Rule "Q3 Enterprise Volume Tier" activated by Administrator', alert_type: 'Rules', type: 'Rules', priority: 'Low', severity: 'LOW', status: 'Read', is_resolved: true, recipient: 'Sales Team', created: '2 days ago', created_at: '2026-09-04T11:20:00Z' },
  { id: 7, title: 'Deal Health Warning: Quote Q-1028 idle in Pending Stage for 5 consecutive days', alert_type: 'Deal Health', type: 'Deal Health', priority: 'High', severity: 'HIGH', status: 'Unread', is_resolved: false, recipient: 'Account Exec', created: '3 hours ago', created_at: '2026-09-06T04:00:00Z' },
  { id: 8, title: 'System Security Audit completed — Zero vulnerabilities detected', alert_type: 'System', type: 'System', priority: 'Low', severity: 'LOW', status: 'Read', is_resolved: true, recipient: 'All Administrators', created: '3 days ago', created_at: '2026-09-03T09:00:00Z' },
];

function Notifications() {
  const context = useOutletContext();
  const setUnreadCount = context?.setUnreadCount;
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchAlerts = async () => {
    setPageLoading(true);
    try {
      const res = await api.getDealAlerts();
      const list = Array.isArray(res) ? res : res.results || [];
      if (list.length > 0) {
        setData(list);
      } else {
        setData(INITIAL_NOTIFICATIONS);
      }
    } catch {
      setData(INITIAL_NOTIFICATIONS);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const unreadCount = data.filter(n => !n.is_resolved && n.status !== 'Read').length;

  useEffect(() => {
    if (setUnreadCount) setUnreadCount(unreadCount);
  }, [unreadCount, setUnreadCount]);

  const filteredData = data.filter(n => {
    const matchSearch = !search || (n.title || n.alert_type || n.message)?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || n.type === filterType || n.alert_type === filterType;
    const matchStatus = !filterStatus || n.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleMarkRead = async (notif) => {
    try {
      if (notif.id) {
        await api.resolveDealAlert(notif.id);
      }
      toast.info('Marked as resolved.');
      await fetchAlerts();
    } catch {
      setData(prev => prev.map(item => item.id === notif.id ? { ...item, is_resolved: true, status: 'Read' } : item));
      toast.info('Marked as resolved.');
    }
  };

  const handleMarkAllRead = () => {
    setData(prev => prev.map(item => ({ ...item, is_resolved: true, status: 'Read' })));
    toast.success('All notifications marked as read.');
  };

  const handleDelete = () => {
    if (!deleteConfirmId) return;
    setData(prev => prev.filter(n => n.id !== deleteConfirmId));
    toast.success('Notification removed.');
    setDeleteConfirmId(null);
  };

  const totalCount = data.length;
  const highPriorityCount = data.filter(n => (n.priority === 'High' || n.severity === 'HIGH') && !n.is_resolved).length;

  const TYPES = ['Approval', 'Inventory', 'Billing', 'Customer', 'Order', 'Rules', 'Deal Health', 'System'];

  const columns = [
    { Header: 'Title', accessor: 'title', sortable: true, Cell: row => <span style={{ fontWeight: row.is_resolved ? '400' : '600', color: row.is_resolved ? '#64748b' : '#0f172a' }}>{row.title || row.alert_type || row.message || 'Notification'}</span> },
    { Header: 'Type', accessor: 'type', sortable: true, Cell: row => <Badge>{row.type || row.alert_type || 'Deal Health'}</Badge> },
    { Header: 'Recipient', accessor: 'recipient', sortable: true, Cell: row => row.recipient || 'System Admin' },
    { Header: 'Priority', accessor: 'priority', sortable: true, Cell: row => <Badge>{row.priority || row.severity || 'Medium'}</Badge> },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status || (row.is_resolved ? 'Read' : 'Unread')}</Badge> },
    { Header: 'Created', accessor: 'created', sortable: true, Cell: row => row.created || row.created_at || 'N/A' },
    {
      Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => (
        <div style={{ display: 'flex', gap: '6px' }}>
          {!row.is_resolved && <button onClick={() => handleMarkRead(row)} className="btn-table-action edit">Resolve</button>}
          <button onClick={() => setDeleteConfirmId(row.id)} className="btn-table-action danger">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Notifications & Alerts</h1>
          <p className="page-subtitle">Manage system-wide alerts, approval triggers, and real-time warnings.</p>
        </div>
        <button className="btn btn-primary" onClick={handleMarkAllRead}>
          Mark All Read
        </button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL ALERTS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
            </div>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">System notifications</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">UNREAD ALERTS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            </div>
          </div>
          <div className="metric-value text-warning">{unreadCount}</div>
          <div className="metric-subtitle">Requires attention</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">HIGH PRIORITY ALERTS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            </div>
          </div>
          <div className="metric-value text-danger">{highPriorityCount}</div>
          <div className="metric-subtitle">Action required</div>
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
        {pageLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading notifications from backend…</div>
        ) : (
          <DataTable columns={columns} data={filteredData} emptyMessage="No notifications found." />
        )}
      </div>

      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Notification" message="Are you sure you want to delete this notification?" />
    </div>
  );
}

export default Notifications;

