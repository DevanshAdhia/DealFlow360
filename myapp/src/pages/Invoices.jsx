import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBilling } from '../context/BillingContext.jsx';
import { formatINR } from '../utils/formatters.js';
import { Search, Filter, ArrowRight, FileText, ChevronDown } from 'lucide-react';

const STATUSES = ['All', 'Draft', 'Issued', 'Paid', 'Partially Paid', 'Overdue', 'Cancelled'];
const STATUS_BADGE = {
  Paid: 'billing-badge-paid',
  Issued: 'billing-badge-issued',
  Overdue: 'billing-badge-overdue',
  Cancelled: 'billing-badge-cancelled',
  'Partially Paid': 'billing-badge-issued',
  Draft: 'billing-badge-neutral',
};

export const Invoices = () => {
  const { invoices } = useBilling();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [customerFilter, setCustomerFilter] = useState('All');
  const [sort, setSort] = useState('newest');

  const customers = useMemo(() => {
    const names = [...new Set(invoices.map(i => i.customerName))].sort();
    return ['All', ...names];
  }, [invoices]);

  const filtered = useMemo(() => {
    let result = [...invoices];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.id.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q) ||
        i.quotationId.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') result = result.filter(i => i.status === statusFilter);
    if (customerFilter !== 'All') result = result.filter(i => i.customerName === customerFilter);

    result.sort((a, b) => {
      if (sort === 'newest') return new Date(b.issueDate) - new Date(a.issueDate);
      if (sort === 'oldest') return new Date(a.issueDate) - new Date(b.issueDate);
      if (sort === 'amount_desc') return b.total - a.total;
      if (sort === 'amount_asc') return a.total - b.total;
      return 0;
    });
    return result;
  }, [invoices, search, statusFilter, customerFilter, sort]);

  const totalFiltered = filtered.reduce((s, i) => s + i.total, 0);

  return (
    <div className="billing-page">
      <div className="billing-page-header">
        <div>
          <h1 className="billing-page-title">Invoices</h1>
          <p className="billing-page-subtitle">{filtered.length} invoice{filtered.length !== 1 ? 's' : ''} · Total {formatINR(totalFiltered)}</p>
        </div>
      </div>

      <div className="billing-section">
        <div className="billing-section-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="billing-search-bar">
            <Search size={16} />
            <input
              className="billing-search-input"
              type="text"
              placeholder="Search invoice, customer, quote..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            <select
              className="payment-modal-select"
              style={{ width: 'auto', margin: 0, padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>

            <select
              className="payment-modal-select"
              style={{ width: 'auto', margin: 0, padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
              value={customerFilter}
              onChange={e => setCustomerFilter(e.target.value)}
            >
              {customers.map(c => <option key={c}>{c}</option>)}
            </select>

            <select
              className="payment-modal-select"
              style={{ width: 'auto', margin: 0, padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="billing-empty-state">
            <FileText size={48} />
            <p>No invoices match your filters.</p>
            <button className="btn btn-secondary" onClick={() => { setSearch(''); setStatusFilter('All'); setCustomerFilter('All'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="billing-table-wrap">
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Customer</th>
                  <th>Quote Ref</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                    <td><span className="billing-invoice-id">{inv.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{inv.customerName}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{inv.quotationId}</td>
                    <td>{new Date(inv.issueDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ color: inv.status === 'Overdue' ? 'var(--color-error)' : 'inherit' }}>
                      {new Date(inv.dueDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="billing-amount-cell">{formatINR(inv.total)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {inv.amountPaid ? formatINR(inv.amountPaid) : '—'}
                    </td>
                    <td>
                      <span className={`billing-badge ${STATUS_BADGE[inv.status] || 'billing-badge-neutral'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="billing-table-action-btn" onClick={() => navigate(`/invoices/${inv.id}`)}>
                        View <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
