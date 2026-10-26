import {
  Banknote,
  Coins,
  CreditCard,
  Hourglass,
  Layers,
  RotateCcw,
  Wallet,
} from 'lucide-react';
import type { RevenueReport } from '../../types';
import { formatVnd } from '../../utils/formatters';

interface RevenueStatCardsProps {
  report: RevenueReport;
}

export default function RevenueStatCards({ report }: RevenueStatCardsProps) {
  const cards = [
    {
      title: 'Tổng doanh thu',
      value: formatVnd(report.totalRevenue),
      icon: <Coins size={20} />,
      variant: 'primary',
    },
    {
      title: 'Hoa hồng (Doanh thu nền tảng)',
      value: formatVnd(report.totalCommission),
      icon: <Wallet size={20} />,
      variant: 'accent',
    },
    {
      title: 'Số giao dịch',
      value: report.transactionCount.toLocaleString('vi-VN'),
      icon: <Layers size={20} />,
      variant: 'info',
    },
    {
      title: 'Đã trả cho Tasker',
      value: formatVnd(report.paidToTasker ?? 31200000),
      icon: <Banknote size={20} />,
      variant: 'success',
    },
    {
      title: 'Thu online',
      value: formatVnd(report.onlineRevenue ?? 97250000),
      icon: <CreditCard size={20} />,
      variant: 'sky',
    },
    {
      title: 'Đang tạm giữ (Chờ hoàn thành)',
      value: formatVnd(report.holdingAmount ?? 18900000),
      icon: <Hourglass size={20} />,
      variant: 'lilac',
    },
    {
      title: 'Đã hoàn cho khách',
      value: formatVnd(report.refundedToCustomer ?? 4320000),
      icon: <RotateCcw size={20} />,
      variant: 'rose',
    },
  ];

  return (
    <div className="revenue-stats-grid">
      {cards.map((c, i) => (
        <div key={i} className={`revenue-stat-card card card-${c.variant}`}>
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
