import React from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { formatINR } from '../../utils/formatters.js';

export const BillingAnalyticsTab = ({
  billingAnalytics = {}
}) => {
  const {
    totalRevenue = 0,
    paidAmount = 0,
    pendingAmount = 0,
    overdueAmount = 0,
    mrr = 0,
    activeSubscriptions = 0,
    paymentStatus = [],
    revenueSplit = []
  } = billingAnalytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="analytics-chart-grid">
        {/* 1. Payment Status Breakdown */}
        <div className="analytics-chart-box">
          <div className="analytics-chart-header">
            <div>
              <h3>Invoice Payment Status</h3>
              <span>Collected vs Pending vs Overdue</span>
            </div>
          </div>
          <div className="chart-wrapper-300">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={paymentStatus} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={65} 
                  outerRadius={95} 
                  paddingAngle={5} 
                  dataKey="value"
                  label={({ name, value }) => `${name} (${formatINR(value)})`}
                >
                  {paymentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => [formatINR(val), 'Amount']}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} 
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. One-Time vs Recurring Annual Split */}
        <div className="analytics-chart-box">
          <div className="analytics-chart-header">
            <div>
              <h3>Revenue Streams Split</h3>
              <span>One-Time Sales vs Annualized Recurring Subscriptions</span>
            </div>
          </div>
          <div className="chart-wrapper-300">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSplit}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                <XAxis dataKey="category" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val) => [formatINR(val), 'Revenue']}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} 
                />
                <Bar dataKey="amount" name="Amount (INR)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Financial Health Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>MONTHLY RECURRING (MRR)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-400)', marginTop: '0.25rem' }}>
            {formatINR(mrr)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>From {activeSubscriptions} active recurring contracts</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: '700' }}>PAID COLLECTIONS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-success)', marginTop: '0.25rem' }}>
            {formatINR(paidAmount)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Successfully realized cash inflow</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: '700' }}>OVERDUE RECEIVABLES</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-error)', marginTop: '0.25rem' }}>
            {formatINR(overdueAmount)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Requires finance collections reminder</div>
        </div>
      </div>
    </div>
  );
};
