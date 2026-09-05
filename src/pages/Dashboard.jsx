import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, getCustomers, getQuotations, getOrders } from '../services/storageService';
import { Badge } from '../components/common/UI';

function Dashboard() {
  const navigate = useNavigate();
  
  const [users] = useState(() => getUsers());
  const [customers] = useState(() => getCustomers());
  const [quotes] = useState(() => getQuotations());
  const [orders] = useState(() => getOrders());
  const [hoveredBar, setHoveredBar] = useState(null);

  const chartData = [
    { month: 'Jan', revenue: 42500, height: 42 },
    { month: 'Feb', revenue: 58400, height: 58 },
    { month: 'Mar', revenue: 39100, height: 39 },
    { month: 'Apr', revenue: 86500, height: 86 },
    { month: 'May', revenue: 64200, height: 64 },
    { month: 'Jun', revenue: 98500, height: 98 },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">High-level overview of DealFlow360 key performance indicators and system health.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary">Download Report</button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/quotations')}>+ New Quote</button>
        </div>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="metric-card active" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/users')}>
          <div className="metric-header">
            <span className="metric-title">TOTAL USERS</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div className="metric-value text-brand">{users.length}</div>
          <div className="metric-subtitle">Active accounts</div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/customers')}>
          <div className="metric-header">
            <span className="metric-title">ACTIVE ACCOUNTS</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div className="metric-value text-success">{customers.length}</div>
          <div className="metric-subtitle">Across all tiers</div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/quotations')}>
          <div className="metric-header">
            <span className="metric-title">OPEN QUOTES</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div className="metric-value text-warning">{quotes.filter(q=>q.status !== 'Approved' && q.status !== 'Rejected').length}</div>
          <div className="metric-subtitle">Pipeline volume</div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/orders')}>
          <div className="metric-header">
            <span className="metric-title">ACTIVE ORDERS</span>
            <svg className="metric-icon text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <div className="metric-value text-danger">{orders.filter(o=>o.fulfillment === 'Processing').length}</div>
          <div className="metric-subtitle">Awaiting fulfillment</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        
        {/* Analytics Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card">
            <div className="card-header">Revenue Overview (YTD)</div>
            <div className="card-body" style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingBottom: '2rem', paddingTop: '2rem' }}>
              {chartData.map((data, i) => (
                <div 
                  key={i} 
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                  style={{ 
                    flex: 1, 
                    height: `${data.height}%`, 
                    background: hoveredBar === i ? 'var(--primary)' : 'linear-gradient(180deg, var(--primary) 0%, rgba(79, 70, 229, 0.2) 100%)', 
                    borderRadius: '4px 4px 0 0', 
                    position: 'relative', 
                    animation: `slideUp ${0.3 + (i * 0.1)}s ease-out backwards`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {hoveredBar === i && (
                    <div style={{
                      position: 'absolute',
                      top: '-40px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      zIndex: 10
                    }}>
                      ${data.revenue.toLocaleString()}
                    </div>
                  )}
                  <span style={{ 
                    position: 'absolute', 
                    bottom: '-25px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    fontSize: '0.75rem', 
                    color: hoveredBar === i ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: hoveredBar === i ? 600 : 400,
                    transition: 'color 0.2s ease, font-weight 0.2s ease'
                  }}>
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
            <div className="card">
              <div className="card-header">Quote Health</div>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem' }}>Approved</span>
                  <strong className="text-success">45%</strong>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-secondary)', borderRadius: '4px', marginBottom: '1.5rem' }}>
                  <div style={{ width: '45%', height: '100%', backgroundColor: 'var(--success)', borderRadius: '4px' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem' }}>Negotiating</span>
                  <strong className="text-warning">35%</strong>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-secondary)', borderRadius: '4px', marginBottom: '1.5rem' }}>
                  <div style={{ width: '35%', height: '100%', backgroundColor: 'var(--warning)', borderRadius: '4px' }}></div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem' }}>Rejected</span>
                  <strong className="text-danger">20%</strong>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-secondary)', borderRadius: '4px' }}>
                  <div style={{ width: '20%', height: '100%', backgroundColor: 'var(--danger)', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">System Alerts</div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)', marginTop: '6px' }}></div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem', marginBottom: '2px' }}>5 products below reorder level</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Inventory module requires attention</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)', marginTop: '6px' }}></div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem', marginBottom: '2px' }}>3 quotes pending approval</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Waiting on Sales Manager review</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand)', marginTop: '6px' }}></div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem', marginBottom: '2px' }}>New Enterprise Customer Added</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Acme Corp was registered today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="card">
          <div className="card-header">Recent Activity</div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 'var(--space-6) var(--space-4)' }}>
            
            <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '15px', top: '32px', bottom: '-24px', width: '2px', backgroundColor: 'var(--border)' }}></div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0 }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', margin: '0 0 4px 0' }}><strong>Admin</strong> created new user <strong>John Doe</strong></p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>10 minutes ago</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '15px', top: '32px', bottom: '-24px', width: '2px', backgroundColor: 'var(--border)' }}></div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0 }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', margin: '0 0 4px 0' }}><strong>Sarah Smith</strong> approved quote <strong>Q-1041</strong></p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>1 hour ago</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '15px', top: '32px', bottom: '-24px', width: '2px', backgroundColor: 'var(--border)' }}></div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0 }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', margin: '0 0 4px 0' }}><strong>System</strong> adjusted inventory for <strong>SKU-892</strong></p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>3 hours ago</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0 }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', margin: '0 0 4px 0' }}><strong>Admin</strong> updated <strong>Discount Rules</strong></p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Yesterday</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
