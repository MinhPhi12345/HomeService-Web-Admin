import { CheckCircle2, DollarSign, Hourglass, Percent } from 'lucide-react';
import type { RevenueReport } from '../../types';
import { formatVnd } from '../../utils/formatters';

interface StatCardsProps {
  report: RevenueReport | null;
  completedCount?: number;
  cancelledCount?: number;
}

export default function StatCards({
  report,
  completedCount = 342,
  cancelledCount = 26,
}: StatCardsProps) {
  const totalRevenue = report ? formatVnd(report.totalRevenue) : '128.450.000 đ';
  const totalCommission = report ? formatVnd(report.totalCommission) : '25.690.000 đ';
  const holdingAmount = report?.holdingAmount ? formatVnd(report.holdingAmount) : '18.900.000 đ';

  return (
    <div className="stats-grid">
      <div className="card stat-card">
        <div className="stat-card-header">
          <span className="stat-card-label">Tổng doanh thu</span>
          <div className="stat-card-icon revenue">
            <DollarSign size={20} />
          </div>
        </div>
        <div className="stat-card-value">{totalRevenue}</div>
        <div className="stat-card-sub text-success">▲ 12% so với tháng trước</div>
      </div>

      <div className="card stat-card">
        <div className="stat-card-header">
          <span className="stat-card-label">Hoa hồng nền tảng (20%)</span>
          <div className="stat-card-icon commission">
            <Percent size={20} />
          </div>
        </div>
        <div className="stat-card-value">{totalCommission}</div>
        <div className="stat-card-sub">Doanh thu của Home Service</div>
      </div>

      <div className="card stat-card">
        <div className="stat-card-header">
          <span className="stat-card-label">Đơn hoàn thành</span>
          <div className="stat-card-icon transactions">
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div className="stat-card-value">{completedCount}</div>
        <div className="stat-card-sub">{cancelledCount} đơn bị hủy</div>
      </div>

      <div className="card stat-card">
        <div className="stat-card-header">
          <span className="stat-card-label">Đang tạm giữ</span>
          <div className="stat-card-icon holding">
            <Hourglass size={20} />
          </div>
        </div>
        <div className="stat-card-value">{holdingAmount}</div>
        <div className="stat-card-sub">Chờ giải ngân</div>
      </div>
    </div>
  );
}
