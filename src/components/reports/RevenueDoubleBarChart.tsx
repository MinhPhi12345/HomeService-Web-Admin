import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RevenueGroupBy, RevenuePoint } from '../../types';
import { formatPeriod, groupByLabel } from '../../utils/dateRange';
import { formatVnd } from '../../utils/formatters';
import { compactVnd } from '../dashboard/DailyRevenueBarChart';
import EmptyState from '../common/EmptyState';

interface RevenueDoubleBarChartProps {
  data: RevenuePoint[];
  groupBy: RevenueGroupBy;
  onSelect?: (point: RevenuePoint) => void;
}

export default function RevenueDoubleBarChart({ data, groupBy, onSelect }: RevenueDoubleBarChartProps) {
  const hasData = data.some((d) => d.revenue > 0 || d.commission > 0);
  const chartData = data.map((d) => ({ ...d, label: formatPeriod(d.period) }));

  return (
    <div className="card double-chart-card">
      <div className="card-header">
        <h3 className="card-title">Doanh thu & hoa hồng theo {groupByLabel(groupBy)}</h3>
        {onSelect && hasData && <span className="card-hint">Nhấn vào cột để xem giao dịch</span>}
      </div>
      {!hasData ? (
        <EmptyState title="Chưa có giao dịch hoàn tất trong khoảng thời gian này." />
      ) : (
        <div className="chart-container" style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 16, left: 4, bottom: 5 }}
              onClick={(e) => {
                const idx = Number((e as { activeTooltipIndex?: number | string } | null)?.activeTooltipIndex);
                const point = Number.isFinite(idx) ? data[idx] : undefined;
                if (point && onSelect && point.transactionCount > 0) onSelect(point);
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="label" stroke="#8CA0A8" tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={12} />
              <YAxis stroke="#8CA0A8" tick={{ fontSize: 11 }} tickFormatter={compactVnd} width={52} />
              <Tooltip
                cursor={{ fill: 'rgba(20,184,166,0.08)' }}
                labelFormatter={(_, payload) => {
                  const p = payload?.[0]?.payload as RevenuePoint | undefined;
                  return p ? `${formatPeriod(p.period, true)} · ${p.transactionCount} giao dịch` : '';
                }}
                formatter={(value, name) => [formatVnd(Number(value ?? 0)), name === 'revenue' ? 'Doanh thu' : 'Hoa hồng']}
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D9E3E6', fontSize: 13 }}
              />
              <Legend formatter={(val) => (val === 'revenue' ? 'Doanh thu' : 'Hoa hồng')} />
              <Bar dataKey="revenue" name="revenue" fill="#14B8A6" radius={[4, 4, 0, 0]} maxBarSize={26} cursor={onSelect ? 'pointer' : undefined} />
              <Bar dataKey="commission" name="commission" fill="#FFB938" radius={[4, 4, 0, 0]} maxBarSize={26} cursor={onSelect ? 'pointer' : undefined} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
