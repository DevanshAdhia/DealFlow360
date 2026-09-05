import React from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export const FulfillmentAnalyticsTab = ({
  fulfillmentAnalytics = {}
}) => {
  const {
    rate = 100,
    fulfilledCount = 0,
    partialCount = 0,
    processingCount = 0,
    totalBackorders = 0,
    statusBreakdown = [],
    warehousePerformance = []
  } = fulfillmentAnalytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="analytics-chart-grid">
        {/* 1. Fulfillment Status Donut */}
        <div className="analytics-chart-box">
          <div className="analytics-chart-header">
            <div>
              <h3>Fulfillment Order Status</h3>
              <span>Fully fulfilled vs partially dispatched vs pending</span>
            </div>
          </div>
          <div className="chart-wrapper-300">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={statusBreakdown} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={65} 
                  outerRadius={95} 
                  paddingAngle={5} 
                  dataKey="value"
                  label={({ name, value }) => `${value} orders`}
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Warehouse Performance BarChart */}
        <div className="analytics-chart-box">
          <div className="analytics-chart-header">
            <div>
              <h3>Regional Warehouse Allocation & Dispatch</h3>
              <span>Stock units allocated across regional hubs</span>
            </div>
          </div>
          <div className="chart-wrapper-300">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehousePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} allowDecimals={false} />
                <Tooltip 
                  formatter={(val, name) => [`${val} units`, name === 'allocated' ? 'Allocated' : 'Fulfilled']}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} 
                />
                <Legend />
                <Bar dataKey="allocated" name="Allocated Units" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fulfilled" name="Fulfilled Units" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Warehouse Logistics Table */}
      <div className="analytics-table-card">
        <div className="analytics-table-header">
          <h3>Warehouse Operations & Inventory Allocation</h3>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Live warehouse nodes</span>
        </div>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Warehouse Node</th>
              <th>Hub ID</th>
              <th>Allocated Units</th>
              <th>Dispatched Units</th>
              <th>Fill Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {warehousePerformance.map((wh) => (
              <tr key={wh.id}>
                <td style={{ fontWeight: '600' }}>{wh.name}</td>
                <td><span className="badge badge-neutral">{wh.id}</span></td>
                <td>{wh.allocated} units</td>
                <td>{wh.fulfilled} units</td>
                <td>
                  <span className={`badge ${wh.fulfillmentRate >= 90 ? 'badge-success' : 'badge-warning'}`}>
                    {wh.fulfillmentRate}%
                  </span>
                </td>
                <td>
                  <span className="badge badge-success">Operational</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
