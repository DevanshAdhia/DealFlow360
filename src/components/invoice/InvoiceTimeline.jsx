import React from 'react';
import { CheckCircle2, Check, Clock } from 'lucide-react';
import { getStageBadgeClass } from '../../services/billingService';

export default function InvoiceTimeline({ stages }) {
  if (!stages || stages.length === 0) return null;

  return (
    <div className="invoice-timeline-card">
      <div className="invoice-timeline-header">
        <h2 className="invoice-timeline-title">
          <CheckCircle2 size={18} color="#4f46e5" style={{ flexShrink: 0 }} />
          <span>Billing & Lifecycle Stage</span>
        </h2>
        <p className="invoice-timeline-subtitle">
          Trace progress from quotation order confirmation through physical fulfillment, invoice issuance, and final payment.
        </p>
      </div>

      <div className="invoice-timeline-grid">
        {stages.map((stage, idx) => {
          const isCompleted = stage.status === 'COMPLETED';
          const isCurrent = stage.status === 'CURRENT';
          const statusClass = isCompleted ? 'completed' : isCurrent ? 'current' : 'waiting';

          return (
            <div
              key={stage.id}
              className={`timeline-step-card ${statusClass}`}
            >
              <div className="timeline-step-top">
                <div className={`timeline-step-num ${statusClass}`}>
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={getStageBadgeClass(stage.status)}>
                  {stage.status}
                </span>
              </div>

              <div className="timeline-step-title">
                {stage.name}
              </div>

              <p className="timeline-step-desc">
                {stage.description}
              </p>

              {stage.timestamp && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border, #e2e8f0)', display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Clock size={12} style={{ marginRight: '4px', flexShrink: 0 }} />
                  {stage.timestamp}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
