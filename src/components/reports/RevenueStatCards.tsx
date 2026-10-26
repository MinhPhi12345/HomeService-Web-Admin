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

const NO_DATA = 'Chưa có dữ liệu';

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
      value: report.paidToTasker !== undefined ? formatVnd(report.paidToTasker) : NO_DATA,
      icon: <Banknote size={20} />,
      variant: 'success',
    },
    {
      title: 'Thu online',
      value: report.onlineRevenue !== undefined ? formatVnd(report.onlineRevenue) : NO_DATA,
      icon: <CreditCard size={20} />,
      variant: 'sky',
    },
    {
      title: 'Đang tạm giữ (Chờ hoàn thành)',
      value: report.holdingAmount !== undefined ? formatVnd(report.holdingAmount) : NO_DATA,
      icon: <Hourglass size={20} />,
      variant: 'lilac',
    },
    {
      title: 'Đã hoàn cho khách',
      value: report.refundedToCustomer !== undefined ? formatVnd(report.refundedToCustomer) : NO_DATA,
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
