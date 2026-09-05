import React from 'react';
import { 
  FileText, 
  FileEdit, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  DollarSign 
} from 'lucide-react';
import { formatINRAbbreviated } from '../../utils/formatters.js';

export const QuotationStats = ({ quotations = [], activeFilter = 'all', onSelectFilter }) => {
  const totalCount = quotations.length;
  const draftQuotes = quotations.filter(q => q.stage === 'draft');
  const pendingQuotes = quotations.filter(q => q.stage === 'pending_approval');
  const negotiationQuotes = quotations.filter(q => q.stage === 'negotiation');
  const confirmedQuotes = quotations.filter(q => q.stage === 'confirmed');

  const draftVal = draftQuotes.reduce((acc, q) => acc + (q.total || q.subtotal || 0), 0);
  const pendingVal = pendingQuotes.reduce((acc, q) => acc + (q.total || q.subtotal || 0), 0);
  const negotiationVal = negotiationQuotes.reduce((acc, q) => acc + (q.total || q.subtotal || 0), 0);
  const confirmedVal = confirmedQuotes.reduce((acc, q) => acc + (q.total || q.subtotal || 0), 0);
  const totalPipelineVal = draftVal + pendingVal + negotiationVal + confirmedVal;

  const stats = [
    {
      key: 'all',
      label: 'TOTAL QUOTES',
      value: totalCount,
      sub: `${formatINRAbbreviated(totalPipelineVal)} Volume`,
      icon: FileText,
      accent: 'var(--primary)',
      badgeBg: 'var(--primary-light)',
      badgeColor: 'var(--primary)'
    },
    {
      key: 'draft',
      label: 'DRAFT',
      value: draftQuotes.length,
      sub: `${formatINRAbbreviated(draftVal)} scoping`,
      icon: FileEdit,
      accent: 'var(--text-secondary)',
      badgeBg: 'var(--surface-secondary)',
      badgeColor: 'var(--text-secondary)'
    },
    {
      key: 'pending_approval',
      label: 'PENDING APPROVAL',
      value: pendingQuotes.length,
      sub: `${formatINRAbbreviated(pendingVal)} in review`,
      icon: Clock,
      accent: 'var(--warning)',
      badgeBg: 'var(--warning-bg)',
      badgeColor: 'var(--warning-text)'
    },
    {
      key: 'negotiation',
      label: 'NEGOTIATION',
      value: negotiationQuotes.length,
      sub: `${formatINRAbbreviated(negotiationVal)} active talks`,
      icon: MessageSquare,
      accent: 'var(--info)',
      badgeBg: 'var(--info-bg)',
      badgeColor: 'var(--info-text)'
    },
    {
      key: 'confirmed',
      label: 'CONFIRMED',
      value: confirmedQuotes.length,
      sub: `${formatINRAbbreviated(confirmedVal)} closed won`,
      icon: CheckCircle2,
      accent: 'var(--success)',
      badgeBg: 'var(--success-bg)',
      badgeColor: 'var(--success-text)'
    },
    {
      key: 'pipeline_value',
      label: 'PIPELINE VALUE',
      value: formatINRAbbreviated(draftVal + pendingVal + negotiationVal),
      sub: 'Open active pipeline',
      icon: DollarSign,
      accent: 'var(--primary)',
      badgeBg: 'var(--primary-light)',
      badgeColor: 'var(--primary)'
    }
  ];

  return (
    <div className="metric-grid">
      {stats.map((s) => {
        const Icon = s.icon;
        const isSelected = activeFilter === s.key;

        return (
          <div
            key={s.key}
            className={`metric-card ${isSelected ? 'active-filter' : ''}`}
            onClick={() => s.key !== 'pipeline_value' && onSelectFilter(isSelected ? 'all' : s.key)}
            style={{
              cursor: s.key !== 'pipeline_value' ? 'pointer' : 'default',
              borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
              boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)'
            }}
          >
            {/* Top Colored Accent Stripe */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: s.accent
              }}
            />

            <div className="metric-card-top">
              <span className="metric-card-label">{s.label}</span>
              <div 
                className="metric-card-icon"
                style={{
                  backgroundColor: s.badgeBg,
                  color: s.badgeColor
                }}
              >
                <Icon size={16} />
              </div>
            </div>

            <div className="metric-card-value" style={{ color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
              {s.value}
            </div>

            <div className="metric-card-sub">
              {s.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
};
