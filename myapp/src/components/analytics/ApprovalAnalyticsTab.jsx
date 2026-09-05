import React from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { formatINR } from '../../utils/formatters.js';

export const ApprovalAnalyticsTab = ({
  approvalAnalytics = {}
}) => {
  const {
    pending = 0,
    approved = 0,
    rejected = 0,
    highRisk = 0,
    avgTurnaroundDays = 1.2,
    statusDistribution = [],
    approvalsByRole = [],
    approvalRate = 100
  } = approvalAnalytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="analytics-chart-grid">
        {/* 1. Approval Status Distribution */}
        <div className="analytics-chart-box">
          <div className="analytics-chart-header">
            <div>
              <h3>Approval Decisions Distribution</h3>
              <span>Pending vs Approved vs Rejected</span>
            </div>
          </div>
          <div className="chart-wrapper-300">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={statusDistribution} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={65} 
                  outerRadius={95} 
                  paddingAngle={5} 
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Approvals by Approver Role */}
        <div className="analytics-chart-box">
          <div className="analytics-chart-header">
            <div>
              <h3>Approval Requests by Routing Role</h3>
              <span>Volume routed to Sales Managers vs Finance Director</span>
            </div>
          </div>
          <div className="chart-wrapper-300">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={approvalsByRole}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                <XAxis dataKey="role" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} allowDecimals={false} />
                <Tooltip 
                  formatter={(val, name, item) => [`${val} requests (${formatINR(item.payload.value)})`, 'Volume']}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} 
                />
                <Bar dataKey="count" name="Request Count" fill="var(--primary-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SLA & Governance Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>APPROVAL WIN RATE</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-success)', marginTop: '0.25rem' }}>
            {approvalRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Approved proposals percentage</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>AVERAGE TURNAROUND</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-400)', marginTop: '0.25rem' }}>
            {avgTurnaroundDays} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>days</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>From submission to final decision</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: '700' }}>HIGH-RISK ESCALATIONS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-error)', marginTop: '0.25rem' }}>
            {highRisk} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>requests</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Excess discounts &gt; 5% requiring Finance review</div>
        </div>
      </div>
    </div>
  );
};
