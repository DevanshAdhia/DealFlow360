import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  ShieldAlert, 
  UserCheck, 
  Split, 
  Clock 
} from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';

export const ActionResolutionModal = ({ action, onClose, onCompleteResolution }) => {
  const { success, info } = useToast();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!action) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (action.type === 'discount_approval') {
        success('Escalation Submitted', `Quote ${action.quoteId} discount review sent to VP Sarah Jenkins.`);
      } else if (action.type === 'negotiation_reply') {
        success('Counter Terms Accepted', `Revised pricing sent to ${action.customer} (${action.quoteId}).`);
      } else if (action.type === 'fulfillment_issue') {
        success('Shipment Routed', `Stock allocated from Chicago Hub for ${action.customer}.`);
      } else {
        success('Action Completed', `Action on ${action.quoteId} successfully processed.`);
      }

      onCompleteResolution(action.id);
      onClose();
    }, 600);
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
          <div className="modal-header">
            <div className="modal-title-group">
              <div className="kpi-icon-container" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' }}>
                <AlertCircle size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {action.title}
                  </span>
                  <span className={`badge ${action.badgeColor}`}>{action.badge}</span>
                </div>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  Target: {action.quoteId} • {action.customer} ({action.amount})
                </span>
              </div>
            </div>

            <button onClick={onClose} className="btn-icon" title="Close">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)'
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Details: </strong>
                {action.description}
              </div>

              {action.type === 'discount_approval' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="form-label">
                    <span>Justification Note for Sales VP (Sarah Jenkins)</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Required</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Competitive pressure against Acme. Client agreed to multi-year commitment with 30-day payment terms."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>
              )}

              {action.type === 'negotiation_reply' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="form-label">
                    <span>Counter-Terms Response / Adjustments</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Accepting $22,800 total price subject to 24-month upfront agreement."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              )}

              {action.type === 'fulfillment_issue' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="form-label">
                    <span>Warehouse Split Instructions</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Ship 40 units immediately from Dallas hub, dispatch remaining 60 units from Chicago hub."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              )}

              {action.type === 'expiry_warning' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="form-label">
                    <span>Automated Follow-up Email Message</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Reminder to finalize proposal terms before tomorrow's expiry."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Execute {action.actionLabel}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
