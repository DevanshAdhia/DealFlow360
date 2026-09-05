import React from 'react';

function Dashboard() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <button className="btn btn-primary">Generate Report</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div className="card">
          <div className="card-body">
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Total Users</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>24</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Active Customers</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>142</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Open Quotations</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>38</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Low Stock Items</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--danger)' }}>12</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>
        <div className="card">
          <div className="card-header">Recent Activity</div>
          <div className="card-body">
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <li style={{ paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border)' }}>
                <span className="badge badge-success" style={{ marginRight: 'var(--space-2)' }}>Quote Approved</span>
                Sarah Connor approved Q-1024
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>10 mins ago</div>
              </li>
              <li style={{ paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border)' }}>
                <span className="badge badge-warning" style={{ marginRight: 'var(--space-2)' }}>Rule Updated</span>
                Admin updated discount limit for Electronics
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>2 hours ago</div>
              </li>
              <li>
                <span className="badge badge-info" style={{ marginRight: 'var(--space-2)' }}>User Added</span>
                Admin created John Doe
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>5 hours ago</div>
              </li>
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-header">System Alerts</div>
          <div className="card-body">
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <li style={{ color: 'var(--danger)', fontWeight: '500' }}>⚠️ 5 products are below reorder level</li>
              <li style={{ color: 'var(--warning)', fontWeight: '500' }}>⚠️ 3 approval rules require review</li>
              <li style={{ color: 'var(--warning)', fontWeight: '500' }}>⚠️ 2 invoices are overdue</li>
              <li style={{ color: 'var(--info)', fontWeight: '500' }}>ℹ️ 7 quotations awaiting approval</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
