import { CheckCircle2, DollarSign, Hourglass, Percent } from 'lucide-react';
import type { RevenueReport } from '../../types';
import { formatVnd } from '../../utils/formatters';

const NO_DATA = 'Chưa có dữ liệu';

interface StatCardsProps {
  report: RevenueReport | null;
  completedCount: number;
  cancelledCount: number;
}

export default function StatCards({
  report,
  completedCount,
  cancelledCount,
}: StatCardsProps) {
  const totalRevenue = report ? formatVnd(report.totalRevenue) : NO_DATA;
  const totalCommission = report ? formatVnd(report.totalCommission) : NO_DATA;
  const holdingAmount =
    report?.holdingAmount !== undefined
      ? formatVnd(report.holdingAmount)
      : NO_DATA;

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
