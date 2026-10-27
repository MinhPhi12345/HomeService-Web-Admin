import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RevenueGroupBy, RevenuePoint } from '../../types';
import { formatPeriod, groupByLabel } from '../../utils/dateRange';
import { formatVnd } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';

interface DailyRevenueBarChartProps {
  data: RevenuePoint[];
  groupBy: RevenueGroupBy;
}

/** Trục Y gọn: 1.200.000 → "1,2tr", 850.000 → "850k" */
export function compactVnd(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr`;
  if (Math.abs(value) >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

export default function DailyRevenueBarChart({ data, groupBy }: DailyRevenueBarChartProps) {
  const hasData = data.some((d) => d.revenue > 0);
  const chartData = data.map((d) => ({ ...d, label: formatPeriod(d.period) }));

  return (
    <div className="card chart-card">
      <h3 className="chart-title">Doanh thu theo {groupByLabel(groupBy)}</h3>
      {!hasData ? (
        <EmptyState title="Chưa có doanh thu trong khoảng thời gian này." />
      ) : (
        <div className="chart-container" style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 16, right: 12, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: '#D9E3E6' }}
                tick={{ fill: '#8CA0A8', fontSize: 11 }}
                interval="preserveStartEnd"
                minTickGap={12}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: '#D9E3E6' }}
                tick={{ fill: '#8CA0A8', fontSize: 11 }}
                tickFormatter={compactVnd}
                width={52}
              />
              <Tooltip
                cursor={{ fill: 'rgba(20,184,166,0.08)' }}
                labelFormatter={(_, payload) => {
                  const p = payload?.[0]?.payload as RevenuePoint | undefined;
                  return p ? formatPeriod(p.period, true) : '';
                }}
                formatter={(value, _name, item) => {
                  const p = item?.payload as RevenuePoint | undefined;
                  return [`${formatVnd(Number(value ?? 0))} · ${p?.transactionCount ?? 0} giao dịch`, 'Doanh thu'];
                }}
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D9E3E6', borderRadius: '8px', fontSize: 13 }}
              />
              <Bar dataKey="revenue" fill="#14B8A6" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
