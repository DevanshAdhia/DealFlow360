import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, TrendingUp, BarChart3 } from 'lucide-react';
import '../styles/variables.css';
import '../styles/global.css';

export const AuthLayout = ({ children }) => {
  return (
    <div style={styles.container} className="auth-container">
      {/* Left Branding Hero Section (Desktop) */}
      <div style={styles.heroSection} className="auth-hero-section">
        <div style={styles.heroOverlay} />
        
        <div style={styles.heroContent}>
          {/* Brand Logo Header */}
          <div style={styles.brandHeader}>
            <div style={styles.logoBadge}>
              <Zap size={24} color="#3b82f6" />
            </div>
            <div>
              <h1 style={styles.brandTitle}>DealFlow360</h1>
              <p style={styles.brandSubtitle}>Intelligent Sales Operations Platform</p>
            </div>
          </div>

          {/* Value Proposition */}
          <div style={styles.valuePropContainer}>
            <h2 style={styles.valueTitle}>
              Self-Governing Sales Operations from Quote to Cash
            </h2>
            <p style={styles.valueDescription}>
              Streamline enterprise deal approval workflows, enforce multi-tier discount compliance, and monitor deal health in real time.
            </p>

            {/* Feature Highlights */}
            <div style={styles.featureList}>
              <div style={styles.featureItem}>
                <ShieldCheck size={20} color="#10b981" />
                <span>Multi-tier Automated Approval Routing</span>
              </div>
              <div style={styles.featureItem}>
                <TrendingUp size={20} color="#3b82f6" />
                <span>AI-assisted Margin & Upsell Recommendations</span>
              </div>
              <div style={styles.featureItem}>
                <BarChart3 size={20} color="#8b5cf6" />
                <span>Real-Time Anomaly & Discount Governance</span>
              </div>
            </div>
          </div>

          {/* Live Hackathon Metric Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={styles.metricCard}
            className="glass-panel"
          >
            <div style={styles.metricItem}>
              <span style={styles.metricValue}>₹40 Cr+</span>
              <span style={styles.metricLabel}>Pipeline Governed</span>
            </div>
            <div style={styles.metricDivider} />
            <div style={styles.metricItem}>
              <span style={styles.metricValue}>99.4%</span>
              <span style={styles.metricLabel}>Margin Compliance</span>
            </div>
            <div style={styles.metricDivider} />
            <div style={styles.metricItem}>
              <span style={styles.metricValue}>&lt; 2 hrs</span>
              <span style={styles.metricLabel}>Avg Approval Cycle</span>
            </div>
          </motion.div>

          <p style={styles.heroFooter}>
            Phase 1 Foundation • Multi-Tenant Role Architecture Activated
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={styles.formSection} className="auth-form-section">
        <div style={styles.formWrapper}>
          {children}
        </div>
        <footer style={styles.authFooter}>
          <span>DealFlow360 Enterprise v1.0</span>
          <span>•</span>
          <span>Security & Compliance Ready</span>
        </footer>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    backgroundColor: 'var(--bg-dark)',
    color: 'var(--text-primary)'
  },
  heroSection: {
    flex: '1.1',
    position: 'relative',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f1f5f9 50%, #e0f2fe 100%)',
    borderRight: '1px solid var(--border-subtle)',
    padding: '3.5rem 4rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  heroOverlay: {
    position: 'absolute',
    top: '-20%',
    left: '-20%',
    width: '140%',
    height: '140%',
    background: 'radial-gradient(circle at 30% 40%, rgba(37, 99, 235, 0.08) 0%, transparent 60%)',
    pointerEvents: 'none'
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '560px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem'
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  logoBadge: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    border: '1px solid rgba(37, 99, 235, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px rgba(37, 99, 235, 0.1)'
  },
  brandTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: '1.2'
  },
  brandSubtitle: {
    fontSize: '0.875rem',
    color: 'var(--primary-600)',
    fontWeight: '600',
    letterSpacing: '0.02em'
  },
  valuePropContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  valueTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    lineHeight: '1.25',
    color: 'var(--text-primary)'
  },
  valueDescription: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6'
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    marginTop: '0.5rem'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.9375rem',
    fontWeight: '500',
    color: 'var(--text-primary)'
  },
  metricCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '1.25rem 1.5rem',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--bg-glass)',
    border: '1px solid var(--border-medium)'
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem'
  },
  metricValue: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--text-primary)'
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  metricDivider: {
    width: '1px',
    height: '32px',
    backgroundColor: 'var(--border-subtle)'
  },
  heroFooter: {
    fontSize: '0.8125rem',
    color: 'var(--text-muted)',
    textAlign: 'center'
  },
  formSection: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '2.5rem',
    backgroundColor: 'var(--bg-dark-secondary)'
  },
  formWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '460px',
    margin: '0 auto'
  },
  authFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    fontSize: '0.8125rem',
    color: 'var(--text-muted)',
    marginTop: '2rem'
  }
};
