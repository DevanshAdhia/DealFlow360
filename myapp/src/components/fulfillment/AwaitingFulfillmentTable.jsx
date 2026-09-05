import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFulfillment } from '../../context/FulfillmentContext.jsx';
import { Truck, ArrowRight, Clock, AlertTriangle, CheckCircle2, Split } from 'lucide-react';
import { formatINRCompact } from '../../utils/formatters.js';

export const AwaitingFulfillmentTable = () => {
  const navigate = useNavigate();
  const { awaitingOrders } = useFulfillment();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SPLIT_PENDING':
        return (
          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--primary-600)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Split size={12} /> Split Pending
          </span>
        );
      case 'BACKORDER':
        return (
          <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertTriangle size={12} /> Backorder
          </span>
        );
      case 'PARTIALLY_FULFILLED':
      case 'PARTIAL':
        return (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={12} /> Partially Fulfilled
          </span>
        );
      case 'ALLOCATED':
      case 'IN_FULFILLMENT':
        return (
          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Truck size={12} /> In Fulfillment
          </span>
        );
      case 'FULFILLED':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={12} /> Fulfilled
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={12} /> Pending Allocation
          </span>
        );
    }
  };

  return (
    <div className="card-surface">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Truck size={20} color="var(--primary-500)" />
            Orders Awaiting Fulfillment
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Commercial orders approved and ready for warehouse allocation and shipping.
          </p>
        </div>
      </div>

      <div className="table-border-wrapper">
        <table className="dealflow-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Order</th>
              <th style={{ textAlign: 'left' }}>Customer</th>
              <th style={{ textAlign: 'left' }}>Status</th>
              <th style={{ textAlign: 'left' }}>Warehouses</th>
              <th style={{ textAlign: 'right' }}>Total Value</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {awaitingOrders.map(order => (
              <tr
                key={order.id}
                onClick={() => navigate(`/fulfillment/${order.id}`)}
                style={{ cursor: 'pointer', transition: 'background var(--transition-fast)' }}
                className="clickable-row"
              >
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--primary-500)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {order.orderNumber}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Ref: {order.quotationId}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.customerName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerContact}</div>
                </td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      background: 'var(--bg-secondary)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      border: '1px solid var(--border-color)'
                    }}>
                      {order.warehousesLabel}
                    </span>
                  </div>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatINRCompact(order.totalAmount)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/fulfillment/${order.id}`);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    View Detail <ArrowRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
