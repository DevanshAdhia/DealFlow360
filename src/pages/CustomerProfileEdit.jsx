import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Lock, AlertCircle } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const CustomerProfileEdit = () => {
  const { currentCustomer, updateCustomerProfile } = useCustomer();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    contactName: '',
    phone: '',
    email: '',
    billingAddress: '',
    shippingAddress: ''
  });

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (currentCustomer) {
      setFormData({
        contactName: currentCustomer.contactName || '',
        phone: currentCustomer.phone || '',
        email: currentCustomer.email || '',
        billingAddress: currentCustomer.billingAddress || '',
        shippingAddress: currentCustomer.shippingAddress || ''
      });
    }
  }, [currentCustomer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.contactName.trim()) {
      setValidationError('Contact person name is required.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setValidationError('A valid corporate email address is required.');
      return;
    }

    try {
      updateCustomerProfile(formData);
      success('Profile updated successfully.');
      navigate('/customer/profile');
    } catch (err) {
      error(err.message || 'Unable to update profile.');
    }
  };

  return (
    <div className="content-wrapper">
      {/* Header and Back button */}
      <div className="page-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/customer/profile')}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem', marginBottom: '1rem' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Profile</span>
        </button>

        <h1 className="page-title">Edit Corporate Profile</h1>
        <p className="page-subtitle">
          Update primary communication contacts and delivery destinations for your organization.
        </p>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="card-surface" style={{ padding: '2rem' }}>
        {validationError && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-error-bg)',
            border: '1px solid var(--color-error-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-error)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{validationError}</span>
          </div>
        )}

        {/* Section 1: Non-editable System Metadata */}
        <div style={{
          backgroundColor: 'var(--bg-surface-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Lock size={13} />
            <span>System Governed Fields (Read-Only)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer ID</div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{currentCustomer?.id}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Company Name</div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{currentCustomer?.companyName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer Tier</div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{currentCustomer?.customerTierId || 'TIER-001 (Enterprise)'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment Terms</div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{currentCustomer?.paymentTerms || 'Net 45'}</div>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Designated Contact Details
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="contactName">
              Contact Person Name <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              className="form-input"
              value={formData.contactName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Corporate Email <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="phone">
            Telephone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="form-input"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        {/* Section 3: Addresses */}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 1rem', color: 'var(--text-primary)' }}>
          Commercial Addresses
        </h3>

        <div className="form-group">
          <label className="form-label" htmlFor="billingAddress">
            Billing Address
          </label>
          <textarea
            id="billingAddress"
            name="billingAddress"
            rows={2}
            className="form-textarea"
            value={formData.billingAddress}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="shippingAddress">
            Shipping & Receiving Address
          </label>
          <textarea
            id="shippingAddress"
            name="shippingAddress"
            rows={2}
            className="form-textarea"
            value={formData.shippingAddress}
            onChange={handleChange}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/customer/profile')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            id="save-profile-btn"
          >
            <Save size={16} />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
