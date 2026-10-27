import { CheckCircle2, DollarSign, Hourglass, Percent } from 'lucide-react';
import type { RevenueReport } from '../../types';
import { formatVnd } from '../../utils/formatters';

const NO_DATA = 'Chưa có dữ liệu';

interface StatCardsProps {
  report: RevenueReport | null;
  completedCount: number;
  cancelledCount: number;
  totalBookings: number;
  days: number;
}

export default function StatCards({ report, completedCount, cancelledCount, totalBookings, days }: StatCardsProps) {
  const rate = report && report.totalRevenue > 0 ? Math.round((report.totalCommission / report.totalRevenue) * 1000) / 10 : null;
  const completionRate = totalBookings > 0 ? Math.round((completedCount / totalBookings) * 1000) / 10 : null;

  return (
    <div className="stats-grid">
      <div className="card stat-card">
        <div className="stat-card-header">
          <span className="stat-card-label">Tổng doanh thu</span>
          <div className="stat-card-icon revenue">
            <DollarSign size={20} />
          </div>
        </div>
        <div className="stat-card-value">{report ? formatVnd(report.totalRevenue) : NO_DATA}</div>
        <div className="stat-card-sub">
          {report ? `${report.transactionCount.toLocaleString('vi-VN')} giao dịch · ${days} ngày qua` : '—'}
        </div>
      </div>

      <div className="card stat-card">
        <div className="stat-card-header">
          <span className="stat-card-label">Hoa hồng nền tảng{rate !== null ? ` (${rate}%)` : ''}</span>
          <div className="stat-card-icon commission">
            <Percent size={20} />
          </div>
        </div>
        <div className="stat-card-value">{report ? formatVnd(report.totalCommission) : NO_DATA}</div>
        <div className="stat-card-sub">Tasker nhận {report ? formatVnd(report.taskerPayout) : '—'}</div>
      </div>

      <div className="card stat-card">
        <div className="stat-card-header">
          <span className="stat-card-label">Đơn hoàn thành</span>
          <div className="stat-card-icon transactions">
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div className="stat-card-value">
          {completedCount.toLocaleString('vi-VN')}
          <small className="stat-card-of"> / {totalBookings.toLocaleString('vi-VN')} đơn</small>
        </div>
        <div className="stat-card-sub">
          {completionRate !== null ? `Tỉ lệ hoàn tất ${completionRate}% · ` : ''}
          {cancelledCount} đơn hủy / hết hạn
        </div>
      </div>

      <div className="card stat-card">
        <div className="stat-card-header">
          <span className="stat-card-label">Đang tạm giữ</span>
          <div className="stat-card-icon holding">
            <Hourglass size={20} />
          </div>
        </div>
        <div className="stat-card-value">{report ? formatVnd(report.heldAmount) : NO_DATA}</div>
        <div className="stat-card-sub">
          Chờ khách xác nhận để giải ngân{report && report.refundedAmount > 0 ? ` · đã hoàn ${formatVnd(report.refundedAmount)}` : ''}
        </div>
      </div>
    </div>
  );
}
