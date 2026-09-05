import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ArrowRight, Shield, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

export const ModulePlaceholder = ({ title, description, phase, features = [] }) => {
  const { user } = useAuth();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.container}
    >
      {/* Module Header Banner */}
      <div style={styles.banner} className="card-surface glass-panel">
        <div style={styles.titleGroup}>
          <div style={styles.iconBox}>
            <Layers size={24} color="var(--primary-500)" />
          </div>
          <div>
            <div style={styles.badgeRow}>
              <span className="badge badge-primary">{phase || 'Phase 2 Architecture'}</span>
              <span className="badge badge-neutral">Role: {user?.roleLabel}</span>
            </div>
            <h1 style={styles.title}>{title}</h1>
            <p style={styles.subtitle}>{description}</p>
          </div>
        </div>

        <div style={styles.statusBox}>
          <Clock size={16} color="var(--color-warning)" />
          <span>Foundation Integration Ready</span>
        </div>
      </div>

      {/* Incoming Feature Grid Preview */}
      <div style={styles.featureGrid}>
        {features.map((feat, index) => (
          <div key={index} style={styles.featureCard} className="card-surface">
            <div style={styles.featureHeader}>
              <CheckCircle2 size={18} color="var(--color-success)" />
              <h3 style={styles.featureTitle}>{feat.name}</h3>
            </div>
            <p style={styles.featureDesc}>{feat.desc}</p>
            <div style={styles.featureMeta}>
              <span>Status: Architecture Ready</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  banner: {
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1.5rem'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem'
  },
  iconBox: {
    width: '52px',
    height: '52px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.375rem'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    lineHeight: '1.2'
  },
  subtitle: {
    fontSize: '0.9375rem',
    color: 'var(--text-secondary)'
  },
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    backgroundColor: 'var(--bg-surface-2)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.25rem'
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  featureHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem'
  },
  featureTitle: {
    fontSize: '1rem',
    fontWeight: '700'
  },
  featureDesc: {
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  },
  featureMeta: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: 'auto',
    paddingTop: '0.5rem',
    borderTop: '1px solid var(--border-subtle)'
  }
};
