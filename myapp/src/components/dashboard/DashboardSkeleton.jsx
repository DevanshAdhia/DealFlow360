import React from 'react';

export const DashboardSkeleton = () => {
  return (
    <div className="dashboard-container">
      {/* Header Skeleton */}
      <div className="dashboard-header-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '300px' }}>
            <div className="skeleton-box" style={{ height: '28px', width: '220px' }} />
            <div className="skeleton-box" style={{ height: '16px', width: '300px' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="skeleton-box" style={{ height: '32px', width: '90px' }} />
            <div className="skeleton-box" style={{ height: '32px', width: '110px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
          <div className="skeleton-box" style={{ height: '36px', flex: 1, maxWidth: '300px' }} />
          <div className="skeleton-box" style={{ height: '36px', width: '130px' }} />
          <div className="skeleton-box" style={{ height: '36px', width: '130px' }} />
          <div className="skeleton-box" style={{ height: '36px', width: '130px' }} />
        </div>
      </div>

      {/* 6 KPI Cards Skeleton */}
      <div className="kpi-cards-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="kpi-card-item">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="skeleton-box" style={{ height: '14px', width: '70px' }} />
              <div className="skeleton-box" style={{ height: '28px', width: '28px', borderRadius: '6px' }} />
            </div>
            <div className="skeleton-box" style={{ height: '32px', width: '100px', margin: '0.25rem 0' }} />
            <div className="skeleton-box" style={{ height: '14px', width: '110px' }} />
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="dashboard-main-grid">
        {/* Left Column */}
        <div className="dashboard-left-col">
          {/* Pipeline */}
          <div className="dash-card">
            <div className="skeleton-box" style={{ height: '24px', width: '200px' }} />
            <div className="skeleton-box" style={{ height: '12px', width: '100%' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="skeleton-box" style={{ height: '64px' }} />
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="dash-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="skeleton-box" style={{ height: '24px', width: '180px' }} />
              <div className="skeleton-box" style={{ height: '32px', width: '110px' }} />
            </div>
            <div className="skeleton-box" style={{ height: '220px', width: '100%' }} />
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right-col">
          {/* Deal Health */}
          <div className="dash-card">
            <div className="skeleton-box" style={{ height: '24px', width: '160px' }} />
            <div className="skeleton-box" style={{ height: '80px', width: '100%' }} />
            <div className="skeleton-box" style={{ height: '100px', width: '100%' }} />
          </div>

          {/* Pending Actions */}
          <div className="dash-card">
            <div className="skeleton-box" style={{ height: '24px', width: '160px' }} />
            <div className="skeleton-box" style={{ height: '70px', width: '100%' }} />
            <div className="skeleton-box" style={{ height: '70px', width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
