import React, { useState } from 'react';
import { 
  Building, 
  Search, 
  CheckCircle2, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  User,
  Layers
} from 'lucide-react';
import { dataService } from '../../services/dataService.js';

export const CustomerSelector = ({ selectedCustomer, onSelectCustomer }) => {
  const [search, setSearch] = useState('');

  const customerList = dataService.getCustomers();

  const filteredCustomers = customerList.filter(c => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.companyName || '').toLowerCase().includes(q) ||
      (c.customerCode || '').toLowerCase().includes(q) ||
      (c.contactName || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.industry || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            Select Target Customer Account
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Selecting an account dynamically binds its Customer Tier, price list multiplier, and discount governance rules.
          </p>
        </div>

        {/* Customer Search */}
        <div className="dashboard-search-box" style={{ maxWidth: '340px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search accounts by name, code, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dashboard-search-input"
          />
        </div>
      </div>

      {/* Customer Picker Grid */}
      <div className="customer-picker-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filteredCustomers.map((customer) => {
          const isSelected = selectedCustomer?.id === customer.id;
          const tier = dataService.getCustomerTierById(customer.customerTierId);

          return (
            <div
              key={customer.id}
              onClick={() => onSelectCustomer(customer)}
              className={`card ${isSelected ? 'selected' : ''}`}
              style={{
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--surface)',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{
                    fontSize: '0.6875rem',
                    fontFamily: 'monospace',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}>
                    {customer.customerCode || customer.id}
                  </span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0 2px 0' }}>
                    {customer.companyName}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {customer.industry}
                  </span>
                </div>

                {isSelected && (
                  <CheckCircle2 size={20} color="var(--primary)" />
                )}
              </div>

              {/* Tier Badge & Governance details */}
              <div style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                borderRadius: '6px',
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.7)' : 'var(--surface-secondary)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: '700',
                    color: tier.badgeColor,
                    backgroundColor: tier.badgeBg,
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {tier.name}
                  </span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Max Rep Disc: <strong>{tier.maxRepDiscount}%</strong>
                  </span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Price Book: <strong>{tier.priceListId}</strong></span>
                  <span>Terms: <strong>{customer.paymentTerms || tier.defaultPaymentTerms}</strong></span>
                </div>
              </div>

              {/* Contact footer */}
              <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={12} />
                  <span>{customer.contactName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={12} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {customer.email}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
