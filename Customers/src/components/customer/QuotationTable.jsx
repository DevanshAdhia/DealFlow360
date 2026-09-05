import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from './StatusBadge.jsx';

const formatINR = (amount) => {
  if (!amount) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const getActionLabel = (status) => {
  const s = (status || '').toUpperCase().replace(/\s+/g, '_');
  switch (s) {
    case 'SENT': return { label: 'Review', style: 'btn-primary' };
    case 'UNDER_NEGOTIATION': return { label: 'Continue', style: 'btn-warning' };
    case 'CONFIRMED': return { label: 'View', style: 'btn-secondary' };
    case 'APPROVAL_REQUIRED':
    case 'APPROVED': return { label: 'View Status', style: 'btn-secondary' };
    default: return { label: 'View', style: 'btn-secondary' };
  }
};

export const QuotationRow = ({ quotation }) => {
  const navigate = useNavigate();
  const action = getActionLabel(quotation.status);

  return (
    <tr className="quotation-table-row">
      <td>
        <span className="qt-id-link" onClick={() => navigate(`/customer/quotations/${quotation.id}`)}>
          {quotation.id}
        </span>
      </td>
      <td className="qt-date">{quotation.createdDate}</td>
      <td className="qt-date">{quotation.validUntil}</td>
      <td className="qt-amount">{formatINR(quotation.total)}</td>
      <td><StatusBadge status={quotation.status} /></td>
      <td className="qt-action">
        <button
          type="button"
          className={`btn ${action.style} btn-sm`}
          onClick={() => navigate(`/customer/quotations/${quotation.id}`)}
          aria-label={`${action.label} quotation ${quotation.id}`}
        >
          {action.label}
        </button>
      </td>
    </tr>
  );
};

export const QuotationTable = ({ quotations = [] }) => {
  const navigate = useNavigate();

  if (quotations.length === 0) {
    return (
      <div className="qt-empty">
        <p>No quotations found.</p>
      </div>
    );
  }

  return (
    <div className="qt-table-wrapper">
      <table className="qt-table" aria-label="Recent Quotations">
        <thead>
          <tr>
            <th>Quotation</th>
            <th>Created</th>
            <th>Valid Until</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map(q => (
            <QuotationRow key={q.id} quotation={q} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
