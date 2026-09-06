import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  DollarSign, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  User, 
  Mail, 
  Layers, 
  Download, 
  Edit3, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';

export const QuoteDetailModal = ({ quote, onClose, onEditQuote, onAdvanceQuote }) => {
  const { success, info } = useToast();

  if (!quote) return null;

  const handleDownloadPDF = () => {
    info('Generating PDF', `Preparing official quotation document for ${quote.id} (${quote.customer})...`);
    setTimeout(() => {
      success('PDF Ready', `Quotation ${quote.id}.pdf compiled with CPQ terms.`);
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="modal-content-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-group">
              <div className="kpi-icon-container" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary-500)' }}>
                <FileText size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="quote-id-badge" style={{ fontSize: '1.1rem' }}>{quote.id}</span>
                  <span className="badge badge-primary">{quote.stage}</span>
                  <span className={`badge ${quote.healthKey === 'healthy' ? 'badge-success' : quote.healthKey === 'critical' ? 'badge-error' : 'badge-warning'}`}>
                    {quote.health}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  {quote.customer} • Primary Contact: {quote.contactPerson}
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="btn-icon"
              style={{ color: 'var(--text-muted)' }}
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* Quick Metrics Grid */}
            <div className="modal-stats-grid">
              <div className="modal-stat-box">
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                  Total Contract Value
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {formatINR(quote.amount)}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Discount: {quote.discount}% ({formatINR((quote.amount * (quote.discount / 100)))})
                </span>
              </div>

              <div className="modal-stat-box">
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                  Gross Margin
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: '800', color: quote.margin >= 30 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                  {quote.margin}%
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {quote.margin >= 30 ? 'Target: >30% (Compliant)' : 'Below 30% RevOps target'}
                </span>
              </div>

              <div className="modal-stat-box">
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                  Proposal Validity
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {quote.validUntil}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Created {quote.timeAgo}
                </span>
              </div>
            </div>

            {/* Risk Factor Alert if At Risk or Critical */}
            {quote.healthKey !== 'healthy' && (
              <div style={{
                padding: '0.875rem',
                backgroundColor: quote.healthKey === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${quote.healthKey === 'critical' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <ShieldAlert size={20} color={quote.healthKey === 'critical' ? 'var(--color-error)' : 'var(--color-warning)'} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    Governance Flag: Risk Score {quote.riskScore}/100
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                    High discount or inventory bottleneck detected. Escalation required for discount over 15%.
                  </div>
                </div>
              </div>
            )}

            {/* Line Items Table */}
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                QUOTED LINE ITEMS & PRODUCT PACKAGES
              </span>

              <table className="modal-items-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(quote.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatINR(item.unitPrice)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>
                        {formatINR(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes Section */}
            {quote.notes && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8125rem'
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Sales Rep Notes: </strong>
                <span style={{ color: 'var(--text-secondary)' }}>{quote.notes}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button 
              onClick={handleDownloadPDF}
              className="btn btn-outline"
            >
              <Download size={15} />
              <span>Export PDF</span>
            </button>

            <button 
              onClick={() => {
                onClose();
                if (onEditQuote) onEditQuote(quote);
              }}
              className="btn btn-secondary"
            >
              <Edit3 size={15} />
              <span>Edit Pricing</span>
            </button>

            <button 
              onClick={() => {
                onClose();
                if (onAdvanceQuote) onAdvanceQuote(quote);
              }}
              className="btn btn-primary"
            >
              <span>{quote.stageKey === 'confirmed' ? 'View Agreement' : 'Advance Workflow'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
