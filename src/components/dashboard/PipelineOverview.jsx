import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  FileEdit, 
  Clock, 
  MessageSquare, 
  CheckCircle2 
} from 'lucide-react';

import { formatINR, formatINRAbbreviated } from '../../utils/formatters.js';

export const PipelineOverview = ({ 
  stages = [], 
  currentFilter = 'all', 
  onSelectStage,
  totalPipelineValue
}) => {
  const navigate = useNavigate();

  const getStageIcon = (id) => {
    switch (id) {
      case 'draft': return FileEdit;
      case 'pending_approval': return Clock;
      case 'negotiation': return MessageSquare;
      case 'confirmed': return CheckCircle2;
      default: return TrendingUp;
    }
  };

  const totalValue = stages.reduce((acc, s) => acc + s.value, 0) || 1;

  return (
    <div style={styles.card}>
      {/* Card Header matching Screenshot */}
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <h3 style={styles.title}>Quote Pipeline</h3>
        </div>

        <button 
          onClick={() => navigate('/quotations')}
          style={styles.viewAllBtn}
          className="btn-view-all"
        >
          View All
        </button>
      </div>

      {/* Visual Segmented Pipeline Bar */}
      <div className="pipeline-progress-bar" title="Pipeline Value Distribution" style={{ borderRadius: '9999px', height: '8px' }}>
        {stages.map((stage) => {
          const widthPercent = Math.max((stage.value / totalValue) * 100, 4);
          return (
            <div
              key={stage.id}
              className="pipeline-segment"
              style={{
                width: `${widthPercent}%`,
                backgroundColor: stage.color,
                opacity: currentFilter === 'all' || currentFilter === stage.id ? 1 : 0.4
              }}
              title={`${stage.name}: ${stage.formattedValue} (${stage.count} deals)`}
            />
          );
        })}
      </div>

      {/* Pipeline Stage Cards Grid */}
      <div style={styles.stagesGrid}>
        {stages.map((stage, idx) => {
          const Icon = getStageIcon(stage.id);
          const isSelected = currentFilter === stage.id;

          return (
            <motion.button
              key={stage.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => onSelectStage && onSelectStage(isSelected ? 'all' : stage.id)}
              style={{
                ...styles.stageCard,
                borderColor: isSelected ? stage.color : '#f1f5f9',
                borderLeft: `3px solid ${stage.color}`
              }}
            >
              <div style={styles.stageTop}>
                <span style={styles.stageName}>{stage.name}</span>
                <Icon size={14} color={stage.color} />
              </div>

              <div style={{ ...styles.stageVal, color: isSelected ? stage.color : '#0f172a' }}>
                {stage.formattedValue}
              </div>

              <div style={styles.stageMeta}>
                <span>{stage.count} {stage.count === 1 ? 'quote' : 'quotes'}</span>
                <span> • {Math.round((stage.value / totalValue) * 100)}%</span>
              </div>
            </motion.button>
          );
        })}
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
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  title: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  viewAllBtn: {
    padding: '0.35rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
  },
  stagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.75rem'
  },
  stageCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #f1f5f9',
    padding: '0.75rem 0.875rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 150ms ease'
  },
  stageTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stageName: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b'
  },
  stageVal: {
    fontSize: '1.15rem',
    fontWeight: '800'
  },
  stageMeta: {
    fontSize: '0.7rem',
    color: '#94a3b8'
  }
};
