import React from 'react';
import { 
  TrendingUp, 
  Layers, 
  MessageSquare, 
  CheckCircle2, 
  Award,
  DollarSign
} from 'lucide-react';
import { formatINRAbbreviated } from '../../utils/formatters.js';

export const PipelineStats = ({ metrics }) => {
  const {
    totalPipelineValue = 0,
    activeDealsCount = 0,
    negotiationValue = 0,
    confirmedValue = 0,
    winRate = 0
  } = metrics || {};

  const stats = [
    {
      label: 'TOTAL PIPELINE VALUE',
      value: formatINRAbbreviated(totalPipelineValue),
      sub: 'All active deal stages',
      icon: DollarSign,
      accent: 'var(--primary)',
      badgeBg: 'var(--primary-light)',
      badgeColor: 'var(--primary)',
      valueColor: 'var(--primary)'
    },
    {
      label: 'ACTIVE PIPELINE DEALS',
      value: `${activeDealsCount} Deals`,
      sub: 'In-flight negotiations',
      icon: Layers,
      accent: 'var(--text-secondary)',
      badgeBg: 'var(--surface-secondary)',
      badgeColor: 'var(--text-secondary)',
      valueColor: 'var(--text-primary)'
    },
    {
      label: 'NEGOTIATION VALUE',
      value: formatINRAbbreviated(negotiationValue),
      sub: 'High-intent proposals',
      icon: MessageSquare,
      accent: 'var(--info)',
      badgeBg: 'var(--info-bg)',
      badgeColor: 'var(--info-text)',
      valueColor: 'var(--info-text)'
    },
    {
      label: 'CONFIRMED WON VALUE',
      value: formatINRAbbreviated(confirmedValue),
      sub: 'Booked commercial agreements',
      icon: CheckCircle2,
      accent: 'var(--success)',
      badgeBg: 'var(--success-bg)',
      badgeColor: 'var(--success-text)',
      valueColor: 'var(--success)'
    },
    {
      label: 'STAGE WIN RATE',
      value: `${winRate}%`,
      sub: 'Proposal to close ratio',
      icon: Award,
      accent: 'var(--primary)',
      badgeBg: 'var(--primary-light)',
      badgeColor: 'var(--primary)',
      valueColor: 'var(--primary)'
    }
  ];

  return (
    <div className="metric-grid">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div key={idx} className="metric-card">
            {/* Top Accent Stripe */}
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

            <div className="metric-card-value" style={{ color: s.valueColor }}>
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
