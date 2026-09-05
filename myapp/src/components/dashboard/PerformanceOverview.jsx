import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const PerformanceOverview = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [hoveredIndex, setHoveredIndex] = useState(7); // default hover on Aug (index 7)

  // Data for 8 months: Jan 2026 to Aug 2026
  const data = {
    revenue: [
      { month: 'Jan', percent: 35, value: '₹35,000' },
      { month: 'Feb', percent: 58, value: '₹58,200' },
      { month: 'Mar', percent: 38, value: '₹38,500' },
      { month: 'Apr', percent: 78, value: '₹78,400' },
      { month: 'May', percent: 62, value: '₹62,100' },
      { month: 'Jun', percent: 95, value: '₹95,000' },
      { month: 'Jul', percent: 70, value: '₹70,300' },
      { month: 'Aug', percent: 82, value: '₹81,600' }
    ],
    orders: [
      { month: 'Jan', percent: 30, value: '3 Orders' },
      { month: 'Feb', percent: 50, value: '5 Orders' },
      { month: 'Mar', percent: 40, value: '4 Orders' },
      { month: 'Apr', percent: 70, value: '7 Orders' },
      { month: 'May', percent: 55, value: '6 Orders' },
      { month: 'Jun', percent: 90, value: '9 Orders' },
      { month: 'Jul', percent: 65, value: '7 Orders' },
      { month: 'Aug', percent: 80, value: '8 Orders' }
    ],
    quotes: [
      { month: 'Jan', percent: 40, value: '6 Quotes' },
      { month: 'Feb', percent: 65, value: '10 Quotes' },
      { month: 'Mar', percent: 45, value: '7 Quotes' },
      { month: 'Apr', percent: 85, value: '14 Quotes' },
      { month: 'May', percent: 70, value: '11 Quotes' },
      { month: 'Jun', percent: 100, value: '16 Quotes' },
      { month: 'Jul', percent: 75, value: '12 Quotes' },
      { month: 'Aug', percent: 88, value: '15 Quotes' }
    ]
  };

  const currentList = data[activeTab] || data.revenue;
  const yLabels = ['100%', '75%', '50%', '25%', '00%'];

  return (
    <div style={styles.card}>
      {/* Card Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Performance Overview</h3>
          <p style={styles.subtitle}>Jan 2026 — Aug 2026 • 8 months</p>
        </div>

        {/* Filter Pills */}
        <div style={styles.pillContainer}>
          {['revenue', 'orders', 'quotes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.pillBtn,
                ...(activeTab === tab ? styles.pillBtnActive : {})
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div style={styles.chartContainer}>
        {/* Y Axis Labels */}
        <div style={styles.yAxis}>
          {yLabels.map((lbl) => (
            <span key={lbl} style={styles.yLabel}>{lbl}</span>
          ))}
        </div>

        {/* Grid and Bars Area */}
        <div style={styles.barsArea}>
          {/* Horizontal Grid lines */}
          <div style={styles.gridLines}>
            <div style={styles.gridLine} />
            <div style={styles.gridLine} />
            <div style={styles.gridLine} />
            <div style={styles.gridLine} />
            <div style={styles.gridLine} />
          </div>

          {/* Bar Columns */}
          <div style={styles.barsRow}>
            {currentList.map((item, idx) => {
              const isTargeted = hoveredIndex === idx;

              return (
                <div 
                  key={item.month} 
                  style={styles.barCol}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(7)} // revert to Aug
                >
                  {/* Floating Tooltip Pill */}
                  {isTargeted && (
                    <motion.div 
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        ...styles.tooltipBadge,
                        bottom: `calc(${item.percent}% + 8px)`
                      }}
                    >
                      <span>{item.value}</span>
                      <div style={styles.tooltipArrow} />
                    </motion.div>
                  )}

                  {/* Gradient Bar */}
                  <div style={styles.barTrack}>
                    <div 
                      style={{
                        ...styles.barFill,
                        height: `${item.percent}%`,
                        opacity: isTargeted ? 1 : 0.85
                      }} 
                    />
                  </div>

                  {/* Month Label */}
                  <span style={{
                    ...styles.xLabel,
                    color: isTargeted ? '#4f46e5' : '#94a3b8',
                    fontWeight: isTargeted ? '700' : '600'
                  }}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  title: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  subtitle: {
    fontSize: '0.775rem',
    color: '#64748b',
    marginTop: '0.2rem',
    margin: 0
  },
  pillContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: '#f8fafc',
    padding: '3px',
    borderRadius: '8px',
    border: '1px solid #f1f5f9'
  },
  pillBtn: {
    background: 'none',
    border: 'none',
    padding: '0.35rem 0.9rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 150ms ease'
  },
  pillBtnActive: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)'
  },
  chartContainer: {
    display: 'flex',
    height: '240px',
    gap: '0.75rem',
    alignItems: 'stretch'
  },
  yAxis: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontSize: '0.675rem',
    fontWeight: '600',
    color: '#94a3b8',
    paddingBottom: '24px' // align with bar base
  },
  yLabel: {
    lineHeight: '1'
  },
  barsArea: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    pointerEvents: 'none'
  },
  gridLine: {
    height: '1px',
    backgroundColor: '#f1f5f9'
  },
  barsRow: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '0.75rem',
    paddingBottom: '24px',
    position: 'relative'
  },
  barCol: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    cursor: 'pointer'
  },
  barTrack: {
    width: '100%',
    maxWidth: '44px',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  barFill: {
    width: '100%',
    borderRadius: '6px 6px 0 0',
    background: 'linear-gradient(180deg, #6366f1 0%, #818cf8 40%, #c084fc 100%)',
    transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease'
  },
  xLabel: {
    position: 'absolute',
    bottom: '-22px',
    fontSize: '0.725rem',
    transition: 'color 150ms ease'
  },
  tooltipBadge: {
    position: 'absolute',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '0.6875rem',
    fontWeight: '700',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    whiteSpace: 'nowrap',
    zIndex: 10,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: '-4px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '4px solid transparent',
    borderRight: '4px solid transparent',
    borderTop: '4px solid #0f172a'
  }
};
