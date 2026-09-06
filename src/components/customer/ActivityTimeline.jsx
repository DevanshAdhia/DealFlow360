import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';

const iconMap = {
  confirmed: { icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4' },
  updated:   { icon: RefreshCw,    color: '#2563eb', bg: '#eff6ff' },
  message:   { icon: MessageSquare,color: '#7c3aed', bg: '#f5f3ff' },
  attention: { icon: AlertCircle,  color: '#d97706', bg: '#fffbeb' },
};

export const ActivityTimeline = ({ activities = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="activity-timeline" aria-label="Recent Activity">
      {activities.map((item, idx) => {
        const config = iconMap[item.type] || iconMap.message;
        const Icon = config.icon;

        return (
          <div
            key={item.id}
            className="activity-item"
            style={{ cursor: item.quotationId ? 'pointer' : 'default' }}
            onClick={() => item.quotationId && navigate(`/customer/quotations/${item.quotationId}`)}
            role={item.quotationId ? 'button' : undefined}
            tabIndex={item.quotationId ? 0 : undefined}
            onKeyDown={item.quotationId ? (e) => e.key === 'Enter' && navigate(`/customer/quotations/${item.quotationId}`) : undefined}
            aria-label={item.description}
          >
            <div className="activity-icon-wrap" style={{ backgroundColor: config.bg, color: config.color }}>
              <Icon size={14} aria-hidden="true" />
            </div>
            <div className="activity-content">
              <div className="activity-desc">{item.description}</div>
              <div className="activity-time">{item.time}</div>
            </div>
            {idx < activities.length - 1 && <div className="activity-line" />}
          </div>
        );
      })}
    </div>
  );
};
