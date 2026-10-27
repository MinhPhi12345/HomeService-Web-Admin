import { ArrowRight, BarChart3, Coins, PieChart, ShieldCheck, UserCheck } from 'lucide-react';
import type { ReportKey, ReportMetaCard } from '../../types/reportsCenter';
import { REPORT_META_CARDS } from '../../utils/reportsCenterConstants';

interface ReportsCenterCardsProps {
  onSelectReport: (key: ReportKey) => void;
  highlights: Partial<Record<ReportKey, string>>;
}

export default function ReportsCenterCards({ onSelectReport, highlights }: ReportsCenterCardsProps) {
  const getIcon = (key: ReportKey) => {
    switch (key) {
      case 'revenue':
        return <Coins size={24} className="text-accent" />;
      case 'bookings-status':
        return <PieChart size={24} className="text-primary" />;
      case 'tasker-performance':
        return <UserCheck size={24} className="text-success" />;
      case 'user-roles':
        return <ShieldCheck size={24} className="text-info" />;
    }
  };

  return (
    <div className="reports-cards-grid">
      {REPORT_META_CARDS.map((card: ReportMetaCard) => (
        <div key={card.key} className="card report-overview-card">
          <div className="report-card-top">
            <div className="report-card-icon-box">{getIcon(card.key)}</div>
            <span className="badge badge-pastel">{card.badgeText}</span>
          </div>

          <h3 className="report-card-title">{card.title}</h3>
          <p className="report-card-desc">{card.description}</p>

          <div className="report-card-footer">
            <div className="report-card-stat">
              <span className="report-stat-label">{card.highlightLabel}</span>
              <span className="report-stat-val">{highlights[card.key] ?? card.highlightValue}</span>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm report-open-btn"
              onClick={() => onSelectReport(card.key)}
            >
              <span>Xem báo cáo</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="report-card-meta-bottom">
            <BarChart3 size={13} className="text-muted" />
            <span>{card.chartTypeName}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
