import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Activity, 
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useToast } from '../hooks/useToast.js';
import { PipelineStats } from '../components/pipeline/PipelineStats.jsx';
import { PipelineColumn } from '../components/pipeline/PipelineColumn.jsx';
import { Button, Input, Select } from '../components/common/UI.jsx';

export const Pipeline = () => {
  const navigate = useNavigate();
  const { quotations, getPipelineMetrics, moveQuotationStage } = useQuotations();
  const { success, error, info } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');

  const metrics = getPipelineMetrics();

  // Filtered quotations for pipeline
  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      // Health filter
      if (healthFilter !== 'all' && (q.health || '').toLowerCase() !== healthFilter.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const idMatch = (q.id || '').toLowerCase().includes(query);
        const custMatch = (q.customerName || q.customer || '').toLowerCase().includes(query);
        const repMatch = (q.salesRepName || '').toLowerCase().includes(query);
        return idMatch || custMatch || repMatch;
      }

      return true;
    });
  }, [quotations, healthFilter, searchQuery]);

  // Group quotes by stage
  const draftQuotes = filteredQuotations.filter(q => q.stage === 'draft');
  const pendingQuotes = filteredQuotations.filter(q => q.stage === 'pending_approval');
  const negotiationQuotes = filteredQuotations.filter(q => q.stage === 'negotiation');
  const confirmedQuotes = filteredQuotations.filter(q => q.stage === 'confirmed');

  const handleStageMovement = (id, newStage) => {
    return moveQuotationStage(id, newStage);
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
      {/* 1. Page Header Area */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Sales Pipeline Governance</h1>
          <p className="page-subtitle">Track commercial deal velocity, discount governance, and stage progression.</p>
        </div>

        <div className="page-actions">
          <Button
            variant="secondary"
            onClick={() => navigate('/quotations')}
          >
            Switch to Ledger View
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/quotations/new')}
          >
            New Quotation
          </Button>
        </div>
      </div>

      {/* 2. KPI / Metric Cards Grid */}
      <PipelineStats metrics={metrics} />

      {/* 3. Main Content Card */}
      <div className="card">
        {/* 3a. Toolbar */}
        <div className="toolbar">
          <div className="toolbar-group">
            <div style={{ minWidth: '260px', flex: '1 1 300px' }}>
              <Input
                type="search"
                placeholder="Search deals by ID, customer, sales rep..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ minWidth: '180px' }}>
              <Select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Health Categories' },
                  { value: 'healthy', label: 'Healthy Deals' },
                  { value: 'at_risk', label: 'At Risk Deals' },
                  { value: 'critical', label: 'Critical Deals' }
                ]}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              Showing <strong>{filteredQuotations.length}</strong> pipeline opportunities
            </span>

            {(searchQuery || healthFilter !== 'all') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setSearchQuery(''); setHealthFilter('all'); }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* 3b. 4-Column Kanban Board */}
        <div className="kanban-board-wrapper" style={{ padding: 'var(--space-4) var(--space-5)', backgroundColor: 'var(--background)' }}>
          <div className="kanban-board-columns">
            {/* Column 1: Draft */}
            <PipelineColumn
              stageId="draft"
              title="Draft"
              color="#64748b"
              quotes={draftQuotes}
              onMoveStage={handleStageMovement}
            />

            {/* Column 2: Pending Approval */}
            <PipelineColumn
              stageId="pending_approval"
              title="Pending Approval"
              color="#f59e0b"
              quotes={pendingQuotes}
              onMoveStage={handleStageMovement}
            />

            {/* Column 3: Negotiation */}
            <PipelineColumn
              stageId="negotiation"
              title="Negotiation"
              color="#3b82f6"
              quotes={negotiationQuotes}
              onMoveStage={handleStageMovement}
            />

            {/* Column 4: Confirmed / Won */}
            <PipelineColumn
              stageId="confirmed"
              title="Confirmed / Won"
              color="#10b981"
              quotes={confirmedQuotes}
              onMoveStage={handleStageMovement}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
