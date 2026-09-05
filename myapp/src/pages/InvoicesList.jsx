import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoiceContext';
import { InvoiceFilters } from '../components/invoice/InvoiceFilters';
import { InvoiceTable } from '../components/invoice/InvoiceTable';
import { formatCurrency } from '../services/invoiceCalculationService';

export default function InvoicesList() {
  const navigate = useNavigate();
  const { invoices, customers } = useInvoices();

  const [activeType, setActiveType] = useState('ALL');
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate high-level summary KPIs
  const kpis = useMemo(() => {
    let totalCount = invoices.length;
    let unpaidCount = 0;
    let unpaidAmount = 0;
    let paidCount = 0;
    let paidAmount = 0;
    let partialCount = 0;
    let overdueCount = 0;
    let overdueAmount = 0;

    invoices.forEach((inv) => {
      const balance = inv.balanceAmount ?? (inv.totalAmount - (inv.paidAmount || 0));
      if (inv.paymentStatus === 'UNPAID') {
        unpaidCount++;
        unpaidAmount += balance;
      } else if (inv.paymentStatus === 'PAID') {
        paidCount++;
        paidAmount += inv.totalAmount;
      } else if (inv.paymentStatus === 'PARTIALLY_PAID') {
        partialCount++;
        unpaidAmount += balance;
      } else if (inv.paymentStatus === 'OVERDUE') {
        overdueCount++;
        overdueAmount += balance;
      }
    });

    return {
      totalCount,
      unpaidCount,
      unpaidAmount,
      paidCount,
      paidAmount,
      partialCount,
      overdueCount,
      overdueAmount
    };
  }, [invoices]);

  // Filter invoices based on active filters & search query
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Type filter
      if (activeType !== 'ALL' && inv.invoiceType !== activeType) {
        return false;
      }

      // Status filter
      if (activeStatus !== 'ALL' && inv.paymentStatus !== activeStatus) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const invNum = (inv.invoiceNumber || inv.id || '').toLowerCase();
        const customer = customers.find((c) => c.id === inv.customerId);
        const custName = (customer?.name || customer?.companyName || inv.customerId || '').toLowerCase();
        const orderId = (inv.orderId || '').toLowerCase();

        return invNum.includes(query) || custName.includes(query) || orderId.includes(query);
      }

      return true;
    });
  }, [invoices, customers, activeType, activeStatus, searchQuery]);

  return (
    <div className="invoice-page-container">
      {/* Page Header */}
      <div className="invoice-page-header">
        <div className="invoice-header-title-group">
          <h1>
            <span>Invoices (List)</span>
            <span className="badge-type badge-type-mixed">
              Screen 12 &bull; Unified Ledger
            </span>
          </h1>
          <p>
            Every invoice generated from one-time and recurring orders. Single shared business entity.
          </p>
        </div>

        <div className="invoice-header-actions">
          <button
            type="button"
            onClick={() => navigate('/sales/fulfillment')}
            className="btn btn-secondary"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Fulfillment Backorders
          </button>
          <button
            type="button"
            onClick={() => navigate('/sales/subscriptions')}
            className="btn btn-primary"
          >
            Subscriptions &amp; Billing &rarr;
          </button>
        </div>
      </div>

      {/* Summary KPI Badges / Cards */}
      <div className="invoice-kpi-grid">
        <div className="invoice-kpi-card accent-total">
          <span className="invoice-kpi-label">Total Invoices</span>
          <div className="invoice-kpi-val-row">
            <span className="invoice-kpi-count">{kpis.totalCount}</span>
            <span className="invoice-kpi-amount total">All types</span>
          </div>
        </div>

        <div className="invoice-kpi-card accent-unpaid">
          <span className="invoice-kpi-label" style={{ color: '#d97706' }}>Unpaid / Pending</span>
          <div className="invoice-kpi-val-row">
            <span className="invoice-kpi-count" style={{ color: '#d97706' }}>{kpis.unpaidCount}</span>
            <span className="invoice-kpi-amount unpaid">{formatCurrency(kpis.unpaidAmount)}</span>
          </div>
        </div>

        <div className="invoice-kpi-card accent-paid">
          <span className="invoice-kpi-label" style={{ color: '#059669' }}>Fully Paid</span>
          <div className="invoice-kpi-val-row">
            <span className="invoice-kpi-count" style={{ color: '#059669' }}>{kpis.paidCount}</span>
            <span className="invoice-kpi-amount paid">{formatCurrency(kpis.paidAmount)}</span>
          </div>
        </div>

        <div className="invoice-kpi-card accent-overdue">
          <span className="invoice-kpi-label" style={{ color: '#dc2626' }}>Overdue</span>
          <div className="invoice-kpi-val-row">
            <span className="invoice-kpi-count" style={{ color: '#dc2626' }}>{kpis.overdueCount}</span>
            <span className="invoice-kpi-amount overdue">{formatCurrency(kpis.overdueAmount)}</span>
          </div>
        </div>
      </div>

      {/* Filters (Type, Payment Status, Search) */}
      <InvoiceFilters
        selectedType={activeType}
        onTypeChange={setActiveType}
        selectedStatus={activeStatus}
        onStatusChange={setActiveStatus}
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        counts={{
          all: invoices.length,
          oneTime: invoices.filter((i) => i.invoiceType === 'ONE_TIME').length,
          recurring: invoices.filter((i) => i.invoiceType === 'RECURRING').length,
          mixed: invoices.filter((i) => i.invoiceType === 'MIXED').length,
          unpaid: invoices.filter((i) => i.paymentStatus === 'UNPAID').length,
          partiallyPaid: invoices.filter((i) => i.paymentStatus === 'PARTIALLY_PAID').length,
          paid: invoices.filter((i) => i.paymentStatus === 'PAID').length,
          overdue: invoices.filter((i) => i.paymentStatus === 'OVERDUE').length
        }}
      />

      {/* Invoices List Table */}
      <InvoiceTable
        invoices={filteredInvoices}
        customers={customers}
      />
    </div>
  );
}

export { InvoicesList };
