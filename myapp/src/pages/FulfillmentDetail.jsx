import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFulfillment } from '../context/FulfillmentContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../hooks/useToast.js';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Split,
  History,
  ShieldAlert,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { formatINRCompact } from '../utils/formatters.js';

import { FulfillmentSummary } from '../components/fulfillment/FulfillmentSummary.jsx';
import { SplitSuggestion } from '../components/fulfillment/SplitSuggestion.jsx';
import { FulfillmentAllocationTable } from '../components/fulfillment/FulfillmentAllocationTable.jsx';
import { BackorderAlert } from '../components/fulfillment/BackorderAlert.jsx';
import { ManualOverrideModal } from '../components/fulfillment/ManualOverrideModal.jsx';
import { checkRestockMatch } from '../services/backorderService.js';

export const FulfillmentDetail = () => {
  const { id, fulfillmentId } = useParams();
  const targetId = fulfillmentId || id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();

  const {
    orders,
    orderItems,
    customers,
    warehouses,
    inventory,
    fulfillmentOrders,
    fulfillmentItems,
    backorders,
    auditLogs,
    getSuggestedSplitForOrder,
    acceptSplit,
    manualOverride,
    consolidateRemainingBackorder,
    simulateRestock,
    setOrderQuantityScenario
  } = useFulfillment();

  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('allocations'); // 'allocations' | 'history'

  // Screen 16: Resolve all entities from ID only
  const orderId = targetId?.startsWith('FO-') ? `SO-${targetId.replace('FO-', '')}` : targetId;
  const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
  const customer = customers.find(c => c.id === order?.customerId);
  const items = orderItems.filter(oi => oi.orderId === orderId);
  const fo = fulfillmentOrders.find(f => f.orderId === orderId || f.id === `FO-${orderId?.replace('SO-', '')}`);
  const currentFulfillmentItems = fulfillmentItems.filter(fi => fi.orderId === orderId || fi.fulfillmentOrderId === fo?.id);
  const currentBackorders = backorders.filter(bo => bo.orderId === orderId);
  const orderAuditLogs = auditLogs.filter(a => a.entityId === orderId || a.entityId === fo?.id);

  // Operations permission check (Operations, Admin, Sales Manager, Finance)
  const userRole = user?.role || 'admin';
  const isOperationsUser = ['admin', 'sales_manager', 'finance', 'operations'].includes(userRole);

  // Calculate live suggested split
  const suggestedSplit = useMemo(() => {
    if (!order) return null;
    return getSuggestedSplitForOrder(order.id);
  }, [order, getSuggestedSplitForOrder]);

  // Check Restock Match (Restock Detection logic)
  const restockMatch = useMemo(() => {
    return checkRestockMatch(orderId, currentBackorders, inventory, warehouses);
  }, [orderId, currentBackorders, inventory, warehouses]);

  if (!order) {
    return (
      <div className="quotations-page-container">
        <div className="card-surface" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'var(--text-primary)' }}>Fulfillment Order Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            The order ID <strong>{id}</strong> could not be resolved from the current sales catalog.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/fulfillment')}>
            Return to Fulfillment List
          </button>
        </div>
      </div>
    );
  }

  // Live status
  const status = fo?.status || order.status || 'PENDING';
  const isAllocated = status === 'ALLOCATED' || status === 'IN_FULFILLMENT' || status === 'FULFILLED';

  // Handle Accept Split
  const handleAcceptSplit = () => {
    try {
      acceptSplit(order.id, user?.name || 'Operations Specialist');
      success(
        'Allocation Successful',
        `Suggested split accepted across ${suggestedSplit.totalShipments} warehouses. Stock reserved.`
      );
    } catch (err) {
      toastError('Allocation Failed', err.message);
    }
  };

  // Handle Manual Override
  const handleApplyOverride = (manualAllocations) => {
    try {
      manualOverride(order.id, manualAllocations, user?.name || 'Operations Lead');
      success(
        'Manual Override Saved',
        'Custom warehouse allocation applied and fulfillment state recalculated.'
      );
    } catch (err) {
      toastError('Override Error', err.message);
    }
  };

  // Handle Consolidate Backorder
  const handleConsolidateBackorder = () => {
    try {
      consolidateRemainingBackorder(order.id, user?.name || 'Operations Manager');
      success(
        'Backorder Consolidated!',
        'Replenished stock allocated. Backorder resolved and status set to FULFILLED.'
      );
    } catch (err) {
      toastError('Consolidation Failed', err.message);
    }
  };

  // Primary ordered item (e.g. Laptop Pro 14)
  const primaryItem = items[0] || { productName: 'Laptop Pro 14', quantity: 24 };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'SPLIT_PENDING':
        return (
          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary-600)', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 700 }}>
            SPLIT PENDING
          </span>
        );
      case 'BACKORDER':
        return (
          <span className="badge badge-error" style={{ fontWeight: 700 }}>
            BACKORDER SHORTAGE
          </span>
        );
      case 'PARTIALLY_FULFILLED':
      case 'PARTIAL':
        return (
          <span className="badge badge-warning" style={{ fontWeight: 700 }}>
            PARTIALLY FULFILLED
          </span>
        );
      case 'ALLOCATED':
      case 'IN_FULFILLMENT':
        return (
          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 700 }}>
            ALLOCATED & DISPATCH READY
          </span>
        );
      case 'FULFILLED':
        return (
          <span className="badge badge-success" style={{ fontWeight: 700 }}>
            FULFILLED (COMPLETE)
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="quotations-page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/fulfillment')} style={{ padding: '0.5rem 0.75rem' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Fulfillment Detail: {order.orderNumber} ({customer?.companyName || 'Acme Corp'})
              </h1>
              {getStatusBadge(status)}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span>Quotation Ref: <strong>{order.quotationId}</strong></span>
              <span>•</span>
              <span>Item: <strong>{primaryItem.quantity}x {primaryItem.productName}</strong></span>
              <span>•</span>
              <span>Destination: {order.shippingAddress || customer?.shippingAddress}</span>
            </div>
          </div>
        </div>

        {/* Quick Demo Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {order.id === 'SO-1042' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Scenario:</span>
              <button
                className={`btn btn-sm ${primaryItem.quantity === 24 ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setOrderQuantityScenario('SO-1042', 24)}
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              >
                24 Units (Full)
              </button>
              <button
                className={`btn btn-sm ${primaryItem.quantity === 30 ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setOrderQuantityScenario('SO-1042', 30)}
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              >
                30 Units (Shortage)
              </button>
            </div>
          )}

          <button
            className="btn btn-outline btn-sm"
            onClick={() => simulateRestock('PROD-007', 'WH-EAST', 4)}
            title="Simulate inbound restock of +4 Laptop Pro 14 at East Depot"
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem' }}
          >
            <RefreshCw size={13} color="var(--color-success)" />
            +4 Restock (East)
          </button>
        </div>
      </div>

      {/* Role Permission Indicator if not Operations */}
      {!isOperationsUser && (
        <div style={{
          background: 'rgba(234, 179, 8, 0.1)',
          border: '1px solid var(--color-warning)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-primary)'
        }}>
          <ShieldAlert size={16} color="var(--color-warning)" />
          <span>
            You are viewing this order in <strong>Sales Rep (View Only)</strong> mode. Allocation approvals and manual overrides require Operations permission.
          </span>
        </div>
      )}

      {/* 5-Metric Summary Cards */}
      <FulfillmentSummary
        totalShipments={fo?.totalShipments || suggestedSplit?.totalShipments || 0}
        shippingCost={fo?.shippingCost || suggestedSplit?.totalShippingCost || 0}
        fulfilledQty={fo?.fulfilledQty || (isAllocated ? primaryItem.quantity : 0)}
        pendingQty={fo?.pendingQty || (isAllocated ? 0 : primaryItem.quantity)}
        backorderQty={fo?.backorderQty || 0}
      />

      {/* Restock Detection and Backorder Alerts */}
      <BackorderAlert
        backorders={currentBackorders}
        restockMatch={restockMatch}
        onConsolidateBackorder={handleConsolidateBackorder}
        isOperationsUser={isOperationsUser}
      />

      {/* Automatic Split Engine Recommendation Card */}
      {status !== 'FULFILLED' && (
        <SplitSuggestion
          suggestedSplit={suggestedSplit}
          onAcceptSplit={handleAcceptSplit}
          onOpenManualOverride={() => setIsOverrideModalOpen(true)}
          isOperationsUser={isOperationsUser}
          isAllocated={isAllocated}
          orderStatus={status}
        />
      )}

      {/* Fulfillment Complete Banner -> Next Step: Subscriptions & Billing */}
      {status === 'FULFILLED' && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
          border: '1px solid var(--color-success)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.0625rem' }}>
                Fulfillment Complete!
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                All line items for <strong>{order.orderNumber} ({customer?.companyName || 'Acme Corp'})</strong> are fully allocated and dispatched. Ready for recurring subscription billing.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/invoices')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
            >
              Invoices
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/subscriptions')}
              style={{
                background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                padding: '0.6rem 1.25rem'
              }}
            >
              Proceed to Subscriptions List (9)
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs (Allocations & History) */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setActiveTab('allocations')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'allocations' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeTab === 'allocations' ? 'var(--primary-500)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'allocations' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.9375rem'
          }}
        >
          Stock Allocations
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'history' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeTab === 'history' ? 'var(--primary-500)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'history' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.9375rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem'
          }}
        >
          <History size={16} /> Audit Trail ({orderAuditLogs.length})
        </button>
      </div>

      {/* Tab 1: Allocations Table */}
      {activeTab === 'allocations' && (
        <FulfillmentAllocationTable
          orderItems={items}
          fulfillmentItems={currentFulfillmentItems}
          warehouses={warehouses}
          suggestedSplit={suggestedSplit}
        />
      )}

      {/* Tab 2: Audit Trail Log */}
      {activeTab === 'history' && (
        <div className="card-surface">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="var(--primary-500)" />
            Order Audit & Operations Trail
          </h3>
          {orderAuditLogs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No audit events logged yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {orderAuditLogs.map(audit => (
                <div
                  key={audit.id}
                  style={{
                    padding: '0.875rem 1rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{audit.action}</span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>by {audit.actor}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{audit.comment}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(audit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual Override Modal */}
      <ManualOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        orderId={order.id}
        orderItems={items}
        inventory={inventory}
        warehouses={warehouses}
        onApplyOverride={handleApplyOverride}
      />
    </div>
  );
};
