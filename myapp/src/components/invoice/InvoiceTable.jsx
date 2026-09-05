import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText } from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

const STATUS_MAP = {
  PAID: 'billing-badge-paid',
  Paid: 'billing-badge-paid',
  PARTIALLY_PAID: 'billing-badge-issued',
  'Partially Paid': 'billing-badge-issued',
  UNPAID: 'billing-badge-neutral',
  Unpaid: 'billing-badge-neutral',
  ISSUED: 'billing-badge-issued',
  Issued: 'billing-badge-issued',
  OVERDUE: 'billing-badge-overdue',
  Overdue: 'billing-badge-overdue',
  CANCELLED: 'billing-badge-cancelled',
  Cancelled: 'billing-badge-cancelled',
};

const TYPE_BADGE_MAP = {
  ONE_TIME: 'badge-type badge-type-onetime',
  RECURRING: 'badge-type badge-type-recurring',
  MIXED: 'badge-type badge-type-mixed'
};

export const InvoiceTable = ({ invoices = [], customers = [] }) => {
  const navigate = useNavigate();
  const customerMap = new Map(customers.map(c => [c.id, c]));

  return (
    <div className="billing-section">
      <div className="billing-section-header">
        <h2 className="billing-section-title">
          <FileText size={18} /> 12. Recent Invoices
        </h2>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} listed
        </span>
      </div>

      {invoices.length === 0 ? (
        <div className="billing-empty-state">
          <FileText size={48} />
          <p>No invoices match the selected filters.</p>
        </div>
      ) : (
        <div className="billing-table-wrap">
          <table className="billing-table">
            <thead>
              <tr>
                <th>INVOICE</th>
                <th>CUSTOMER</th>
                <th>TYPE</th>
                <th>AMOUNT</th>
                <th>DUE DATE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const cust = customerMap.get(inv.customerId);
                const customerName = cust ? (cust.name || cust.companyName) : (inv.customerName || 'Acme Corporation');
                const amount = inv.totalAmount ?? inv.total ?? 0;
                const formattedDate = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : '—';
                const statusBadgeClass = STATUS_MAP[inv.paymentStatus] || 'billing-badge-neutral';
                const typeBadgeClass = TYPE_BADGE_MAP[inv.invoiceType] || 'badge-type badge-type-mixed';

                return (
                  <tr
                    key={inv.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/sales/invoices/${inv.id}`)}
                    className="clickable-row"
                  >
                    <td>
                      <span className="billing-invoice-id">{inv.invoiceNumber || inv.id}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {customerName}
                    </td>
                    <td>
                      <span className={typeBadgeClass}>
                        {inv.invoiceType ? inv.invoiceType.replace('_', ' ') : 'ONE TIME'}
                      </span>
                    </td>
                    <td className="billing-amount-cell">
                      {formatINR(amount)}
                    </td>
                    <td style={{ color: inv.paymentStatus === 'OVERDUE' ? 'var(--color-error)' : 'inherit' }}>
                      {formattedDate}
                    </td>
                    <td>
                      <span className={`billing-badge ${statusBadgeClass}`}>
                        {inv.paymentStatus ? inv.paymentStatus.replace('_', ' ') : 'UNPAID'}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="billing-table-action-btn"
                        onClick={() => navigate(`/sales/invoices/${inv.id}`)}
                      >
                        13. View Detail <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
