import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Edit3, 
  ShieldCheck 
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext.jsx';

export const CustomerProfile = () => {
  const { currentCustomer } = useCustomer();
  const navigate = useNavigate();

  return (
    <div>
      {/* Page Header */}
      {/* Page Header */}
      <div className="page-header" style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 className="page-title">Customer Profile</h1>
          <p className="page-subtitle">
            Manage your corporate information, shipping locations, and designated contacts.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/customer/profile/edit')}
          id="edit-profile-btn"
        >
          <Edit3 size={16} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Sections Grid */}
      <div className="profile-grid">
        {/* Company Information */}
        {/* Company Information */}
        <div className="profile-card" style={{ borderTop: '4px solid #8b5cf6' }}>
          <div className="profile-card-header">
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
              <Building2 size={20} />
            </div>
            <h2 className="profile-card-title" style={{ margin: 0 }}>Company Information</h2>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span className="profile-label">Company Name</span>
              <span className="profile-value">{currentCustomer?.companyName || '—'}</span>
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Customer Code</span>
              <span className="profile-value">{currentCustomer?.customerCode || '—'}</span>
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Industry Sector</span>
              <span className="profile-value">{currentCustomer?.industry || 'Enterprise Technology'}</span>
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Account Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <ShieldCheck size={16} color="var(--color-success)" />
                <span style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '0.875rem' }}>
                  {currentCustomer?.status || 'ACTIVE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {/* Contact Information */}
        <div className="profile-card" style={{ borderTop: '4px solid #3b82f6' }}>
          <div className="profile-card-header">
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
              <User size={20} />
            </div>
            <h2 className="profile-card-title" style={{ margin: 0 }}>Contact Information</h2>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span className="profile-label">Designated Contact Person</span>
              <span className="profile-value">{currentCustomer?.contactName || '—'}</span>
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Email Address</span>
              <span className="profile-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} color="var(--text-muted)" />
                {currentCustomer?.email || '—'}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Telephone Number</span>
              <span className="profile-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={14} color="var(--text-muted)" />
                {currentCustomer?.phone || '—'}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Commercial Currency</span>
              <span className="profile-value">{currentCustomer?.currency || 'INR'}</span>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        {/* Billing Information */}
        <div className="profile-card" style={{ borderTop: '4px solid #10b981' }}>
          <div className="profile-card-header">
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#d1fae5', color: '#047857' }}>
              <CreditCard size={20} />
            </div>
            <h2 className="profile-card-title" style={{ margin: 0 }}>Billing Information</h2>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span className="profile-label">Billing Address</span>
              <span className="profile-value" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                <MapPin size={16} color="var(--text-muted)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                <span>{currentCustomer?.billingAddress || 'No billing address provided.'}</span>
              </span>
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Payment Terms</span>
              <span className="profile-value">{currentCustomer?.paymentTerms || 'Net 30'}</span>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        {/* Shipping Information */}
        <div className="profile-card" style={{ borderTop: '4px solid #f59e0b' }}>
          <div className="profile-card-header">
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
              <MapPin size={20} />
            </div>
            <h2 className="profile-card-title" style={{ margin: 0 }}>Shipping & Logistics</h2>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span className="profile-label">Delivery Receiving Dock</span>
              <span className="profile-value" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                <MapPin size={16} color="var(--text-muted)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                <span>{currentCustomer?.shippingAddress || 'No shipping address provided.'}</span>
              </span>
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Special Delivery Instructions</span>
              <span className="profile-value" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Standard freight receiving during business hours (9:00 AM – 5:00 PM).
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
