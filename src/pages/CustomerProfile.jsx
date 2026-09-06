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
import { useAuth } from '../hooks/useAuth.js';
import { useCustomer } from '../context/CustomerContext.jsx';

export const CustomerProfile = () => {
  const { currentCustomer } = useCustomer();
  const { user } = useAuth();
  const navigate = useNavigate();

  const storedUserRaw = localStorage.getItem('dealflow360_user') || localStorage.getItem('user');
  let activeUser = user;
  if (!activeUser && storedUserRaw) {
    try { activeUser = JSON.parse(storedUserRaw); } catch {}
  }

  const displayName = activeUser?.name || currentCustomer?.contactName || 'Om';
  const displayEmail = activeUser?.email || currentCustomer?.email || 'om@gmail.com';
  const displayCompany = activeUser?.company || currentCustomer?.companyName || `${displayName}'s Business`;
  const displayPhone = activeUser?.phone || (currentCustomer?.phone && currentCustomer?.phone !== '+91 98765 00500' ? currentCustomer.phone : 'Not Provided');
  const displayIndustry = activeUser?.industry || (currentCustomer?.industry && currentCustomer?.industry !== 'Enterprise Technology' ? currentCustomer.industry : 'Not Specified');
  const displayCustomerCode = activeUser?.customerCode || currentCustomer?.customerCode || 'CUS-OM';

  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <div className="page-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        gap: '1rem',
        marginBottom: '1.75rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Customer Profile</h1>
          <p className="page-subtitle" style={{ margin: '0.35rem 0 0 0' }}>
            Manage your corporate information, shipping locations, and designated contacts.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/customer/profile/edit')}
          id="edit-profile-btn"
          style={{ width: 'auto', flexShrink: 0, height: '38px', padding: '0 1.25rem' }}
        >
          <Edit3 size={16} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Sections Grid */}
      <div className="profile-grid">
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
              <span className="profile-value">{displayCompany}</span>
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Customer Code</span>
              <span className="profile-value">{displayCustomerCode}</span>
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Industry Sector</span>
              <span className="profile-value">{displayIndustry}</span>
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
              <span className="profile-value">{displayName}</span>
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Email Address</span>
              <span className="profile-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} color="var(--text-muted)" />
                {displayEmail}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Telephone Number</span>
              <span className="profile-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={14} color="var(--text-muted)" />
                {displayPhone}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Commercial Currency</span>
              <span className="profile-value">{currentCustomer?.currency || 'INR'}</span>
            </div>
          </div>
        </div>

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
                <span>{user?.billingAddress || currentCustomer?.billingAddress || 'No billing address provided.'}</span>
              </span>
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Payment Terms</span>
              <span className="profile-value">{user?.paymentTerms || currentCustomer?.paymentTerms || 'Net 30'}</span>
            </div>
          </div>
        </div>

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
                <span>{user?.shippingAddress || currentCustomer?.shippingAddress || 'No shipping address provided.'}</span>
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
