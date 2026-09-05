import React from 'react';
import { motion } from 'framer-motion';

export const KPICard = ({ 
  title, 
  value, 
  subtext,
  icon: Icon, 
  topColor = '#6366f1',
  valueColor = '#4f46e5',
  badgeBg = '#ede9fe',
  badgeColor = '#6366f1',
  index = 0,
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="kpi-card-styled"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '1.125rem 1.25rem',
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        overflow: 'hidden'
      }}
    >
      {/* Colored Top Border Line */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: topColor
        }} 
      />

      {/* Header with Title and Icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '0.6875rem',
          fontWeight: '700',
          color: '#64748b',
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}>
          {title}
        </span>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: badgeBg,
          color: badgeColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {Icon && <Icon size={16} />}
        </div>
      </div>

      {/* Value */}
      <div style={{
        fontSize: '1.75rem',
        fontWeight: '800',
        color: valueColor,
        lineHeight: '1.1',
        letterSpacing: '-0.02em'
      }}>
        {value}
      </div>

      {/* Subtitle */}
      {subtext && (
        <div style={{
          fontSize: '0.75rem',
          color: '#64748b',
          marginTop: '0.15rem'
        }}>
          {subtext}
        </div>
      )}
    </motion.div>
  );
};
