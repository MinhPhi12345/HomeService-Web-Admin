import { Banknote, Coins, CreditCard, Hourglass, Layers, RotateCcw, Wallet, HandCoins } from 'lucide-react';
import type { RevenueReport } from '../../types';
import { formatVnd } from '../../utils/formatters';

interface RevenueStatCardsProps {
  report: RevenueReport;
}

export default function RevenueStatCards({ report }: RevenueStatCardsProps) {
  const rate = report.totalRevenue > 0 ? Math.round((report.totalCommission / report.totalRevenue) * 1000) / 10 : 0;
  const cards = [
    { title: 'Tổng doanh thu', value: formatVnd(report.totalRevenue), icon: <Coins size={20} />, variant: 'primary' },
    {
      title: `Hoa hồng nền tảng (${rate}%)`,
      value: formatVnd(report.totalCommission),
      icon: <Wallet size={20} />,
      variant: 'accent',
    },
    {
      title: 'Số giao dịch hoàn tất',
      value: report.transactionCount.toLocaleString('vi-VN'),
      icon: <Layers size={20} />,
      variant: 'info',
    },
    { title: 'Đã giải ngân cho Tasker', value: formatVnd(report.taskerPayout), icon: <Banknote size={20} />, variant: 'success' },
    { title: 'Thu online (ví / thẻ)', value: formatVnd(report.onlineRevenue), icon: <CreditCard size={20} />, variant: 'sky' },
    { title: 'Thu tiền mặt', value: formatVnd(report.cashRevenue), icon: <HandCoins size={20} />, variant: 'peach' },
    {
      title: 'Đang tạm giữ (chờ hoàn thành)',
      value: formatVnd(report.heldAmount),
      icon: <Hourglass size={20} />,
      variant: 'lilac',
    },
    { title: 'Đã hoàn cho khách', value: formatVnd(report.refundedAmount), icon: <RotateCcw size={20} />, variant: 'rose' },
  ];

  return (
    <div className="revenue-stats-grid">
      {cards.map((c) => (
        <div key={c.title} className={`revenue-stat-card card card-${c.variant}`}>
          <div className="stat-card-header">
            <span className="stat-card-title">{c.title}</span>
            <span className={`stat-card-icon icon-${c.variant}`}>{c.icon}</span>
          </div>
          <div className="stat-card-value">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
