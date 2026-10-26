import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BookingsSummaryItem } from '../../types';
import { DASHBOARD_LABELS } from '../../utils/constants';
import EmptyState from '../common/EmptyState';

interface BookingsChartProps {
  data: BookingsSummaryItem[];
}

const STATUS_NAME_MAP: Record<string, string> = {
  Pending: 'Đang tìm Tasker',
  Matched: 'Chờ Tasker',
  Accepted: 'Đã nhận đơn',
  InProgress: 'Đang làm',
  Completed: 'Chờ xác nhận',
  Paid: 'Đã thanh toán',
  Cancelled: 'Đã hủy',
  Rejected: 'Từ chối',
  NoTaskerFound: 'Chưa có Tasker',
  Expired: 'Hết hạn',
  AwaitingPayment: 'Chờ thanh toán',
  Disputed: 'Khiếu nại',
  Refunded: 'Đã hoàn tiền',
  PaymentOverdue: 'Quá hạn',
};

export default function BookingsChart({ data }: BookingsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card chart-card">
        <h3 className="chart-title">{DASHBOARD_LABELS.CHART_TITLE}</h3>
        <EmptyState title={DASHBOARD_LABELS.EMPTY_CHART} />
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: STATUS_NAME_MAP[item.status] ?? item.status,
    count: item.count,
  }));

  return (
    <div className="card chart-card">
      <h3 className="chart-title">{DASHBOARD_LABELS.CHART_TITLE}</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 16, right: 16, left: -16, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [`${value ?? 0} ${DASHBOARD_LABELS.UNIT_COUNT}`, 'Số lượng']}
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-subtle)',
                fontSize: 13,
              }}
            />
            <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
