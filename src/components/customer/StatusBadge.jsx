import React from 'react';

const statusConfig = {
  'Sent': { label: 'Sent', className: 'badge-sent' },
  'SENT': { label: 'Sent', className: 'badge-sent' },
  'Under Negotiation': { label: 'Under Negotiation', className: 'badge-negotiation' },
  'UNDER_NEGOTIATION': { label: 'Under Negotiation', className: 'badge-negotiation' },
  'Confirmed': { label: 'Confirmed', className: 'badge-confirmed' },
  'CONFIRMED': { label: 'Confirmed', className: 'badge-confirmed' },
  'Approval Required': { label: 'Approval Required', className: 'badge-approval' },
  'APPROVED': { label: 'Ready for Approval', className: 'badge-approval' },
  'Rejected': { label: 'Declined', className: 'badge-rejected' },
  'REJECTED': { label: 'Declined', className: 'badge-rejected' },
  'Expired': { label: 'Expired', className: 'badge-expired' },
  'EXPIRED': { label: 'Expired', className: 'badge-expired' },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { label: status, className: 'badge-default' };
  return (
    <span className={`status-badge-v2 ${config.className}`} aria-label={`Status: ${config.label}`}>
      {config.label}
    </span>
  );
};
