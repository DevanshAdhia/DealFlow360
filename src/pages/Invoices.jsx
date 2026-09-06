import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBilling } from '../context/BillingContext.jsx';
import { formatINR } from '../utils/formatters.js';
import { Search, FileText, ArrowRight, Package, CreditCard } from 'lucide-react';
import { useToast } from '../hooks/useToast.js';

export const Invoices = () => {
  const { invoices } = useBilling();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, ONE_TIME, RECURRING, MIXED
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL'); // ALL, Unpaid, Partially Paid, Paid, Overdue

  // Combine default and seeded mock invoices to match screenshot 2
  const enrichedInvoices = useMemo(() => {
    if (!invoices || invoices.length === 0) {
      return [
        {
          id: 'INV-1001',
          customerName: 'Acme Corp',
          invoiceType: 'ONE_TIME',
          total: 59000,
          issueDate: '2026-09-01',
          dueDate: '2026-10-01',
          status: 'Unpaid',
          amountPaid: 0
        },
        {
          id: 'INV-1002',
          customerName: 'Global Tech',
          invoiceType: 'RECURRING',
          total: 10620,
          issueDate: '2026-08-15',
          dueDate: '2026-09-15',
          status: 'Paid',
          amountPaid: 10620
        }
      ];
    }
    return invoices.map((inv, idx) => ({
      ...inv,
      id: inv.id || `INV-${1001 + idx}`,
      customerName: inv.customerName || inv.customer || 'Customer',
      invoiceType: inv.invoiceType || (idx % 2 === 0 ? 'ONE_TIME' : 'RECURRING'),
      total: inv.total || inv.total_amount || inv.amount || 59000,
      status: inv.status === 'Issued' ? 'Unpaid' : inv.status || 'Unpaid',
      dueDate: inv.dueDate || inv.due_date || '2026-10-01'
    }));
  }, [invoices]);

  const filtered = useMemo(() => {
    return enrichedInvoices.filter(inv => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        (inv.id || '').toLowerCase().includes(q) ||
        (inv.customerName || '').toLowerCase().includes(q);

      const matchesType = typeFilter === 'ALL' || inv.invoiceType === typeFilter;
      
      const invStatus = (inv.status || '').toLowerCase();
      const matchStatus = statusFilter === 'ALL' ||
        (statusFilter === 'Unpaid' && (invStatus === 'unpaid' || invStatus === 'issued')) ||
        (statusFilter === 'Paid' && invStatus === 'paid') ||
        (statusFilter === 'Partially Paid' && invStatus === 'partially paid') ||
        (statusFilter === 'Overdue' && invStatus === 'overdue');

      return matchesSearch && matchesType && matchStatus;
    });
  }, [enrichedInvoices, search, typeFilter, statusFilter]);

  // KPI Metrics calculation
  const totalCount = enrichedInvoices.length;
  const unpaidInvoices = enrichedInvoices.filter(i => (i.status || '').toLowerCase() === 'unpaid' || (i.status || '').toLowerCase() === 'issued');
  const unpaidCount = unpaidInvoices.length;
  const unpaidSum = unpaidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

  const paidInvoices = enrichedInvoices.filter(i => (i.status || '').toLowerCase() === 'paid');
  const paidCount = paidInvoices.length;
  const paidSum = paidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

  const overdueInvoices = enrichedInvoices.filter(i => (i.status || '').toLowerCase() === 'overdue');
  const overdueCount = overdueInvoices.length;
  const overdueSum = overdueInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem 1.5rem 3rem 1.5rem', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Invoices (List)
            </h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: '6px',
              backgroundColor: '#e0e7ff',
              color: '#4338ca',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              SCREEN 12 • UNIFIED LEDGER
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Every invoice generated from one-time and recurring orders. Single shared business entity.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => navigate('/sales/fulfillment')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.1rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <Package size={15} />
            Fulfillment Backorders
          </button>

          <button
            type="button"
            onClick={() => navigate('/sales/subscriptions')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.25rem',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)'
            }}
          >
            Subscriptions & Billing →
          </button>
        </div>
      </div>

      {/* 2. Top KPI Grid (Exact match to screenshot 2) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* TOTAL INVOICES */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          borderTop: '3px solid #3b82f6',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOTAL INVOICES</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{totalCount}</div>
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2563eb', alignSelf: 'flex-end' }}>All types</span>
        </div>

        {/* UNPAID / PENDING */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          borderTop: '3px solid #f97316',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>UNPAID / PENDING</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{unpaidCount}</div>
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ea580c', alignSelf: 'flex-end' }}>{formatINR(unpaidSum)}</span>
        </div>

        {/* FULLY PAID */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          borderTop: '3px solid #10b981',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>FULLY PAID</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{paidCount}</div>
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#16a34a', alignSelf: 'flex-end' }}>{formatINR(paidSum)}</span>
        </div>

        {/* OVERDUE */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          borderTop: '3px solid #ef4444',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OVERDUE</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{overdueCount}</div>
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#dc2626', alignSelf: 'flex-end' }}>{formatINR(overdueSum)}</span>
        </div>
      </div>

      {/* 3. Search & Pill Filters Box */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Row 1: Search + Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '0.4rem 0.75rem',
            width: '300px'
          }}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search invoice #, customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.8125rem', color: '#0f172a' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Type:</span>
            {[
              { id: 'ALL', label: 'All Types' },
              { id: 'ONE_TIME', label: 'One-Time' },
              { id: 'RECURRING', label: 'Recurring' },
              { id: 'MIXED', label: 'Mixed' }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTypeFilter(t.id)}
                style={{
                  border: typeFilter === t.id ? 'none' : '1px solid #cbd5e1',
                  backgroundColor: typeFilter === t.id ? '#2563eb' : '#ffffff',
                  color: typeFilter === t.id ? '#ffffff' : '#475569',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Payment Status Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Payment:</span>
          {[
            { id: 'ALL', label: 'All Statuses' },
            { id: 'Unpaid', label: 'Unpaid' },
            { id: 'Partially Paid', label: 'Partially Paid' },
            { id: 'Paid', label: 'Paid' },
            { id: 'Overdue', label: 'Overdue' }
          ].map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStatusFilter(s.id)}
              style={{
                border: statusFilter === s.id ? 'none' : '1px solid #cbd5e1',
                backgroundColor: statusFilter === s.id ? '#4338ca' : '#ffffff',
                color: statusFilter === s.id ? '#ffffff' : '#475569',
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Table Card: Recent Invoices */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#0f172a', fontSize: '0.9375rem' }}>
            <FileText size={16} color="#2563eb" />
            <span>Recent Invoices</span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            {filtered.length} invoice{filtered.length !== 1 ? 's' : ''} listed
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>INVOICE</th>
                <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>CUSTOMER</th>
                <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>TYPE</th>
                <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>AMOUNT</th>
                <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>DUE DATE</th>
                <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>STATUS</th>
                <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const isPaid = (inv.status || '').toLowerCase() === 'paid';
                const isOneTime = inv.invoiceType === 'ONE_TIME';

                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => navigate(`/sales/invoices/${inv.id}`)}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 800, color: '#2563eb', fontSize: '0.8125rem' }}>
                      {inv.id}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                      {inv.customerName}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: isOneTime ? '#eff6ff' : '#f3e8ff',
                        color: isOneTime ? '#1d4ed8' : '#7e22ce',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        {isOneTime ? 'ONE TIME' : 'RECURRING'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 800, color: '#0f172a', fontSize: '0.875rem' }}>
                      {formatINR(inv.total)}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.8125rem', color: '#475569' }}>
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : '1/10/2026'}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '3px 9px',
                        borderRadius: '9999px',
                        backgroundColor: isPaid ? '#dcfce7' : '#f1f5f9',
                        color: isPaid ? '#15803d' : '#475569',
                        textTransform: 'uppercase'
                      }}>
                        {isPaid ? 'PAID' : 'UNPAID'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/sales/invoices/${inv.id}`)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        View Detail <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
