import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Code, 
  Database, 
  Layers, 
  FileText, 
  ShieldCheck, 
  CheckCircle2,
  Package,
  Receipt,
  Repeat,
  Truck
} from 'lucide-react';
import { dataService } from '../../services/dataService.js';
import { useToast } from '../../hooks/useToast.js';
import { useQuotations } from '../../context/QuotationContext.jsx';
import { useInvoices } from '../../context/InvoiceContext.jsx';
import { useBilling } from '../../context/BillingContext.jsx';
import { useFulfillment } from '../../context/FulfillmentContext.jsx';
import { useApprovals } from '../../context/ApprovalContext.jsx';

export const JsonInspectorModal = ({ isOpen = true, onClose, quotationData = null, title = "Live JSON Inspector" }) => {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(quotationData ? 'current_quotation' : 'full_snapshot');

  // Pull live state from all application contexts
  const { allQuotations = [] } = useQuotations();
  const { invoices = [] } = useInvoices();
  const { subscriptions = [] } = useBilling();
  const { awaitingOrders = [], inventory = [], warehouses = [] } = useFulfillment();
  const { approvals = [] } = useApprovals();

  const getLiveProducts = () => {
    try {
      const saved = localStorage.getItem('dealflow360_products_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return dataService.getProducts();
  };

  const getLiveCustomers = () => {
    try {
      const saved = localStorage.getItem('dealflow360_customers_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return dataService.getCustomers();
  };

  const liveProducts = getLiveProducts();
  const liveCustomers = getLiveCustomers();

  if (!isOpen) return null;

  // Resolve JSON payload based on selected tab
  let displayJson = {};
  let payloadName = 'dealflow360_payload.json';

  switch (activeTab) {
    case 'full_snapshot':
      displayJson = {
        system: "DealFlow360 — Live System Relational State",
        exportedAt: new Date().toISOString(),
        counts: {
          quotations: allQuotations.length,
          invoices: invoices.length,
          subscriptions: subscriptions.length,
          approvals: approvals.length,
          fulfillmentOrders: awaitingOrders.length,
          products: liveProducts.length,
          customers: liveCustomers.length
        },
        quotations: allQuotations,
        invoices: invoices,
        subscriptions: subscriptions,
        approvals: approvals,
        fulfillment: {
          awaitingOrders,
          inventory,
          warehouses
        },
        products: liveProducts,
        priceLists: dataService.getPriceLists(),
        priceListItems: dataService.getPriceListItems(),
        customers: liveCustomers,
        customerTiers: dataService.getCustomerTiers(),
        categories: dataService.getCategories(),
        discountRules: dataService.getDiscountRules(),
        approvalRules: dataService.getApprovalRules(),
        approvalLevels: dataService.getApprovalLevels(),
        users: dataService.getUsers(),
        roles: dataService.getRoles()
      };
      payloadName = 'dealflow360_whole_system_snapshot.json';
      break;

    case 'current_quotation':
      displayJson = quotationData || { message: "No active quotation selected." };
      payloadName = `quotation_${quotationData?.quotationNumber || quotationData?.id || 'draft'}.json`;
      break;

    case 'all_quotations':
      displayJson = {
        totalRecords: allQuotations.length,
        quotations: allQuotations
      };
      payloadName = 'quotations_collection.json';
      break;

    case 'invoices':
      displayJson = {
        totalRecords: invoices.length,
        invoices: invoices
      };
      payloadName = 'invoices_ledger.json';
      break;

    case 'subscriptions':
      displayJson = {
        totalRecords: subscriptions.length,
        subscriptions: subscriptions
      };
      payloadName = 'subscriptions_registry.json';
      break;

    case 'fulfillment':
      displayJson = {
        awaitingOrdersCount: awaitingOrders.length,
        warehousesCount: warehouses.length,
        awaitingOrders,
        inventory,
        warehouses
      };
      payloadName = 'fulfillment_stock.json';
      break;

    case 'customer_tiers':
      displayJson = {
        totalCustomers: liveCustomers.length,
        customers: liveCustomers,
        customerTiers: dataService.getCustomerTiers()
      };
      payloadName = 'customers_and_tiers.json';
      break;

    case 'pricing_and_catalog':
      displayJson = {
        totalProducts: liveProducts.length,
        products: liveProducts,
        priceLists: dataService.getPriceLists(),
        priceListItems: dataService.getPriceListItems()
      };
      payloadName = 'products_and_pricelists.json';
      break;

    case 'approval_governance':
      displayJson = {
        activeApprovalsCount: approvals.length,
        approvals,
        approvalRules: dataService.getApprovalRules(),
        approvalLevels: dataService.getApprovalLevels()
      };
      payloadName = 'approval_governance.json';
      break;

    default:
      displayJson = quotationData || {};
  }

  const jsonString = JSON.stringify(displayJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    success('JSON Copied', 'JSON payload copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = payloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    success('JSON Downloaded', `Downloaded ${payloadName}`);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.15s ease'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          backgroundColor: '#0F172A',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#F8FAFC'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#1E293B'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div 
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'rgba(79, 70, 229, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818CF8'
              }}
            >
              <Code size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
                  {title}
                </h3>
                <span 
                  style={{
                    fontSize: '0.6875rem',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#34D399',
                    fontWeight: '600'
                  }}
                >
                  SOURCE: src/data/*.json
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
                Relational entity schema loaded from JSON source files with foreign-key IDs (No localStorage).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleCopy}
              className="btn"
              style={{
                backgroundColor: copied ? '#10B981' : '#334155',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8125rem',
                fontWeight: '600',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="btn"
              style={{
                backgroundColor: '#334155',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8125rem',
                fontWeight: '600',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Download size={14} />
              <span>Export .json</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div 
          style={{
            display: 'flex',
            gap: '0.35rem',
            padding: '0.6rem 1.25rem',
            backgroundColor: '#0F172A',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            overflowX: 'auto'
          }}
        >
          {/* Full Snapshot (Whole JSON) */}
          <button
            onClick={() => setActiveTab('full_snapshot')}
            style={{
              background: activeTab === 'full_snapshot' ? 'rgba(79, 70, 229, 0.35)' : 'transparent',
              color: activeTab === 'full_snapshot' ? '#A5B4FC' : '#94A3B8',
              border: activeTab === 'full_snapshot' ? '1px solid rgba(99, 102, 241, 0.6)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Database size={13} color="#818CF8" />
            <span>Show Whole JSON</span>
          </button>

          {quotationData && (
            <button
              onClick={() => setActiveTab('current_quotation')}
              style={{
                background: activeTab === 'current_quotation' ? 'rgba(79, 70, 229, 0.35)' : 'transparent',
                color: activeTab === 'current_quotation' ? '#A5B4FC' : '#94A3B8',
                border: activeTab === 'current_quotation' ? '1px solid rgba(99, 102, 241, 0.6)' : '1px solid transparent',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap'
              }}
            >
              <FileText size={13} />
              <span>Active Quote ({quotationData.quotationNumber || quotationData.id})</span>
            </button>
          )}

          {/* Quotations Live */}
          <button
            onClick={() => setActiveTab('all_quotations')}
            style={{
              background: activeTab === 'all_quotations' ? 'rgba(79, 70, 229, 0.35)' : 'transparent',
              color: activeTab === 'all_quotations' ? '#A5B4FC' : '#94A3B8',
              border: activeTab === 'all_quotations' ? '1px solid rgba(99, 102, 241, 0.6)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <FileText size={13} />
            <span>Quotations ({allQuotations.length})</span>
          </button>

          {/* Invoices Live */}
          <button
            onClick={() => setActiveTab('invoices')}
            style={{
              background: activeTab === 'invoices' ? 'rgba(79, 70, 229, 0.35)' : 'transparent',
              color: activeTab === 'invoices' ? '#A5B4FC' : '#94A3B8',
              border: activeTab === 'invoices' ? '1px solid rgba(99, 102, 241, 0.6)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Receipt size={13} />
            <span>Invoices ({invoices.length})</span>
          </button>

          {/* Subscriptions Live */}
          <button
            onClick={() => setActiveTab('subscriptions')}
            style={{
              background: activeTab === 'subscriptions' ? 'rgba(79, 70, 229, 0.35)' : 'transparent',
              color: activeTab === 'subscriptions' ? '#A5B4FC' : '#94A3B8',
              border: activeTab === 'subscriptions' ? '1px solid rgba(99, 102, 241, 0.6)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Repeat size={13} />
            <span>Subscriptions ({subscriptions.length})</span>
          </button>

          {/* Fulfillment Live */}
          <button
            onClick={() => setActiveTab('fulfillment')}
            style={{
              background: activeTab === 'fulfillment' ? 'rgba(79, 70, 229, 0.35)' : 'transparent',
              color: activeTab === 'fulfillment' ? '#A5B4FC' : '#94A3B8',
              border: activeTab === 'fulfillment' ? '1px solid rgba(99, 102, 241, 0.6)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Truck size={13} />
            <span>Fulfillment ({awaitingOrders.length})</span>
          </button>

          {/* Catalog & Price Lists */}
          <button
            onClick={() => setActiveTab('pricing_and_catalog')}
            style={{
              background: activeTab === 'pricing_and_catalog' ? 'rgba(79, 70, 229, 0.35)' : 'transparent',
              color: activeTab === 'pricing_and_catalog' ? '#A5B4FC' : '#94A3B8',
              border: activeTab === 'pricing_and_catalog' ? '1px solid rgba(99, 102, 241, 0.6)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Package size={13} />
            <span>Catalog & Pricing ({liveProducts.length})</span>
          </button>

          {/* Customers & Tiers */}
          <button
            onClick={() => setActiveTab('customer_tiers')}
            style={{
              background: activeTab === 'customer_tiers' ? 'rgba(79, 70, 229, 0.35)' : 'transparent',
              color: activeTab === 'customer_tiers' ? '#A5B4FC' : '#94A3B8',
              border: activeTab === 'customer_tiers' ? '1px solid rgba(99, 102, 241, 0.6)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Layers size={13} />
            <span>Customers & Tiers ({liveCustomers.length})</span>
          </button>

          {/* Approval Governance */}
          <button
            onClick={() => setActiveTab('approval_governance')}
            style={{
              background: activeTab === 'approval_governance' ? 'rgba(79, 70, 229, 0.35)' : 'transparent',
              color: activeTab === 'approval_governance' ? '#A5B4FC' : '#94A3B8',
              border: activeTab === 'approval_governance' ? '1px solid rgba(99, 102, 241, 0.6)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <ShieldCheck size={13} />
            <span>Approval Rules ({approvals.length})</span>
          </button>
        </div>

        {/* JSON Code View */}
        <div 
          style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            backgroundColor: '#090D16',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '0.8125rem',
            lineHeight: '1.5'
          }}
        >
          <pre 
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: '#38BDF8'
            }}
          >
            {jsonString}
          </pre>
        </div>

        {/* Footer */}
        <div 
          style={{
            padding: '0.65rem 1.25rem',
            backgroundColor: '#1E293B',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#94A3B8'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
            <span>Relational foreign-key structure loaded via dedicated dataService layer.</span>
          </div>
          <div>
            Bytes: <strong>{new Blob([jsonString]).size.toLocaleString()} B</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
