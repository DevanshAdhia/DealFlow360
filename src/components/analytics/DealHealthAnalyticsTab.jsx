import React from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export const DealHealthAnalyticsTab = ({
  dealHealthAnalytics = { distribution: [], riskFactorsBreakdown: [] }
}) => {
  const { distribution = [], riskFactorsBreakdown = [], avgScore = 0, healthy = 0, atRisk = 0, critical = 0 } = dealHealthAnalytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="analytics-chart-grid">
        {/* 1. Health Distribution PieChart */}
        <div className="analytics-chart-box">
          <div className="analytics-chart-header">
            <div>
              <h3>Portfolio Health Distribution</h3>
              <span>Healthy (0–30), At Risk (31–60), Critical (61–100)</span>
            </div>
          </div>
          <div className="chart-wrapper-300">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={distribution} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={65} 
                  outerRadius={95} 
                  paddingAngle={5} 
                  dataKey="value"
                  label={({ name, value }) => `${value} deals`}
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Risk Factors Average Impact BarChart */}
        <div className="analytics-chart-box">
          <div className="analytics-chart-header">
            <div>
              <h3>Average Risk Score by Signal</h3>
              <span>Deterministic 6-factor commercial breakdown</span>
            </div>
          </div>
          <div className="chart-wrapper-300">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskFactorsBreakdown} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                <XAxis type="number" domain={[0, 100]} stroke="var(--text-secondary)" fontSize={12} />
                <YAxis dataKey="factor" type="category" stroke="var(--text-secondary)" fontSize={12} width={130} />
                <Tooltip 
                  formatter={(val, name, item) => [`${val}/100 (Weight: ${item.payload.weight})`, 'Average Risk']}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} 
                />
                <Bar dataKey="avgScore" name="Avg Risk Score" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Matrix Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>PORTFOLIO RISK INDEX</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: avgScore > 60 ? 'var(--color-error)' : avgScore > 30 ? 'var(--color-warning)' : 'var(--color-success)', marginTop: '0.25rem' }}>
            {avgScore} / 100
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {avgScore <= 30 ? 'Low Systemic Risk' : avgScore <= 60 ? 'Moderate Monitoring' : 'Immediate Escalation Required'}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: '700' }}>HEALTHY RATIO</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-success)', marginTop: '0.25rem' }}>
            {healthy} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>deals</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Standard governance compliant</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: '700' }}>CRITICAL BOTTLENECKS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-error)', marginTop: '0.25rem' }}>
            {critical} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>deals</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>High discount excess or stalled approvals</div>
        </div>
      </div>
    </div>
  );
};
