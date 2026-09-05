import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Mail,
  Phone,
  ArrowRight
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext.jsx';

const FAQS = [
  {
    id: 'faq-1',
    question: 'What does "Under Negotiation" mean?',
    answer: 'When a quotation is "Under Negotiation", you have either requested changes, proposed a counter discount, or submitted questions on specific line items. The quotation is actively being reviewed by our Sales team to prepare an adjusted commercial offer for your company.'
  },
  {
    id: 'faq-2',
    question: 'What happens after I submit a counter offer?',
    answer: 'Once you submit a counter offer or discount proposal, our sales representative is immediately notified. If the requested terms fall within the sales representative\'s pre-authorized allowance, they will promptly issue a revised quotation. If the requested terms exceed standard guidelines, the system automatically routes the proposal to Sales and Finance Management for approval.'
  },
  {
    id: 'faq-3',
    question: 'Why does my quotation require approval?',
    answer: 'DealFlow360 operates under automated commercial governance. If a discount, quantity adjustment, or credit term exceeds pre-configured threshold parameters, the request is flagged as "Approval Required". A Sales Director or Commercial Finance Manager must review and approve the concession before the revised quotation is released.'
  },
  {
    id: 'faq-4',
    question: 'What happens if my request is rejected?',
    answer: 'If your proposed terms cannot be approved, you will see a transparent explanation outlining the reason (such as exceeding maximum discount limits for your customer tier). From the rejection screen, you can immediately "Negotiate Again" by adjusting the discount, requesting alternative quantities or products, or consulting directly with your dedicated account team.'
  },
  {
    id: 'faq-5',
    question: 'How do I confirm a quotation?',
    answer: 'When you are satisfied with the commercial terms of an active, approved, or revised quotation, click the "Confirm Quotation" button. You will review the final terms and check an agreement box before confirming. Once confirmed, the quotation is locked from further modifications.'
  },
  {
    id: 'faq-6',
    question: 'What happens after confirmation?',
    answer: 'Upon confirmation, the status transitions to "CONFIRMED". DealFlow360 automatically converts the proposal into a formal sales order and transmits it to our automated fulfillment, warehouse, and billing systems for delivery execution according to your agreed payment terms.'
  }
];

export const CustomerHelp = () => {
  const [openFaq, setOpenFaq] = useState('faq-1');
  const { currentCustomer } = useCustomer();
  const navigate = useNavigate();

  const toggleFaq = (id) => {
    setOpenFaq(prev => prev === id ? null : id);
  };

  return (
    <div className="content-wrapper" style={{ width: '100%', boxSizing: 'border-box', paddingBottom: '60px' }}>
      {/* Header Banner - Clean White Theme consistent with Design System */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '28px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#eff6ff',
          color: '#1d4ed8',
          border: '1px solid #bfdbfe',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          <HelpCircle size={14} />
          <span>Customer Support & Guidance</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
          How can we help you, {currentCustomer?.contactName?.split(' ')[0] || 'John'}?
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9375rem', maxWidth: '680px', lineHeight: 1.5 }}>
          Learn how to review proposals, submit counter discounts, navigate approval workflows, and securely confirm quotations for <strong>{currentCustomer?.companyName || 'Acme Corporation'}</strong>.
        </p>
      </div>

      {/* Workflow Visual Guide */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        marginBottom: '28px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
          The DealFlow360 Quotation Journey
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { step: '1', title: 'Review Quote', desc: 'Inspect line items, specs & commercial terms', icon: FileText, color: '#2563eb' },
            { step: '2', title: 'Negotiate / Counter', desc: 'Request line changes or counter discount', icon: MessageSquare, color: '#f59e0b' },
            { step: '3', title: 'Approval Review', desc: 'Automated threshold governance review', icon: Clock, color: '#8b5cf6' },
            { step: '4', title: 'Revised Offer', desc: 'Examine previous vs updated proposal', icon: ShieldCheck, color: '#0284c7' },
            { step: '5', title: 'Confirm & Fulfill', desc: 'Lock agreement and proceed to fulfillment', icon: CheckCircle2, color: '#16a34a' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `${item.color}15`,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}>
                    <Icon size={18} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>STEP {item.step}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a', marginBottom: '4px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '28px',
        border: '1px solid #e2e8f0',
        marginBottom: '28px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0' }}>
          Frequently Asked Questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQS.map(faq => {
            const isOpen = openFaq === faq.id;
            return (
              <div
                key={faq.id}
                style={{
                  border: isOpen ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  background: isOpen ? '#f8faff' : '#ffffff',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    gap: '16px'
                  }}
                  aria-expanded={isOpen}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: isOpen ? '#1d4ed8' : '#1e293b' }}>
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={18} color="#2563eb" />
                  ) : (
                    <ChevronDown size={18} color="#64748b" />
                  )}
                </button>

                {isOpen && (
                  <div style={{
                    padding: '0 20px 18px 20px',
                    fontSize: '0.875rem',
                    color: '#475569',
                    lineHeight: 1.6,
                    borderTop: '1px dashed #e2e8f0',
                    paddingTop: '14px'
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Team Contact */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }}>
            Need Immediate Dedicated Assistance?
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Your account representative <strong>Sarah Wilson</strong> is available Monday – Friday, 9:00 AM – 6:00 PM.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <a
            href="mailto:support@dealflow360.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '9px',
              background: '#f1f5f9',
              color: '#334155',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            <Mail size={16} />
            <span>Email Account Team</span>
          </a>

          <button
            type="button"
            onClick={() => navigate('/customer/quotations')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '9px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <span>Go to Quotations</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
