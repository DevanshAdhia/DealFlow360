import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { formatINR } from '../../utils/formatters.js';

const STATUS_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];

export const SalesAnalyticsTab = ({
  revenueTrend = [],
  pipelineByStage = [],
  dealsByStatus = [],
  salesRepPerformance = []
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="analytics-chart-grid">
        {/* 1. Revenue Trend LineChart */}
        <div className="analytics-chart-box">
          <div className="analytics-chart-header">
            <div>
              <h3>Monthly Cash Inflow & Revenue Trend</h3>
              <span>Paid invoices over recent period</span>
            </div>
          </div>
          <div className="chart-wrapper-300">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val) => [formatINR(val), 'Revenue']}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Paid Revenue (INR)" 
                  stroke="var(--primary-500)" 
                  strokeWidth={3} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Pipeline by Stage BarChart */}
        <div className="analytics-chart-box">
          <div className="analytics-chart-header">
            <div>
              <h3>Pipeline Value by Stage</h3>
              <span>Total deal value in each sales milestone</span>
            </div>
          </div>
          <div className="chart-wrapper-300">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineByStage}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val) => [formatINR(val), 'Pipeline Value']}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} 
                />
                <Bar dataKey="value" name="Stage Total (INR)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="analytics-chart-grid">
        {/* 3. Deals by Status PieChart */}
        <div className="analytics-chart-box">
          <div className="analytics-chart-header">
            <div>
              <h3>Deals Distribution by Status</h3>
              <span>Volume breakdown across active quotation states</span>
            </div>
          </div>
          <div className="chart-wrapper-300">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={dealsByStatus} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={65} 
                  outerRadius={90} 
                  paddingAngle={5} 
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dealsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Sales Rep Performance Horizontal BarChart */}
        <div className="analytics-chart-box">
          <div className="analytics-chart-header">
            <div>
              <h3>Sales Rep Performance (Won Revenue)</h3>
              <span>Confirmed contract value closed per representative</span>
            </div>
          </div>
          <div className="chart-wrapper-300">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesRepPerformance} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                <XAxis type="number" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} stroke="var(--text-secondary)" fontSize={11} />
                <YAxis dataKey="rep" type="category" stroke="var(--text-secondary)" fontSize={12} width={90} />
                <Tooltip 
                  formatter={(val) => [formatINR(val), 'Confirmed Revenue']}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} 
                />
                <Bar dataKey="confirmedRevenue" name="Revenue (INR)" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
