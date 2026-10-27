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
import type { RevenueBarItem } from '../../types/reportsCenter';
import type { RevenueGroupBy } from '../../types';
import { formatPeriod, groupByLabel } from '../../utils/dateRange';
import { compactVnd } from '../dashboard/DailyRevenueBarChart';
import { formatVnd } from '../../utils/formatters';
import { REPORT_CHART_COLORS } from '../../utils/reportsCenterConstants';
import EmptyState from '../common/EmptyState';

interface RevenueBarReportProps {
  items: RevenueBarItem[];
  groupBy: RevenueGroupBy;
  totals: { totalRevenue: number; totalCommission: number; transactionCount: number };
  onSelect: (item: RevenueBarItem) => void;
}

export default function RevenueBarReport({ items, groupBy, totals, onSelect }: RevenueBarReportProps) {
  if (!items || items.every((i) => i.orderCount === 0)) {
    return <EmptyState title="Chưa có doanh thu trong khoảng thời gian này." />;
  }

  const handleOpenDetail = (item: RevenueBarItem) => {
    if (item.orderCount > 0) onSelect(item);
  };
  const tableRows = items.filter((i) => i.orderCount > 0);

  return (
    <div className="report-view-wrapper">
      <div className="card report-chart-card">
        <div className="chart-header-row">
          <div>
            <h3 className="chart-title">Doanh thu & hoa hồng nền tảng theo {groupByLabel(groupBy)} (Bar Chart)</h3>
            <p className="chart-subtitle">Nhấn vào từng cột để xem danh sách giao dịch của kỳ đó</p>
          </div>
          <div className="chart-totals-badge">
            <span>Tổng: <strong>{formatVnd(totals.totalRevenue)}</strong></span>
            <span>Hoa hồng: <strong>{formatVnd(totals.totalCommission)}</strong></span>
          </div>
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={items}
              margin={{ top: 20, right: 16, left: 4, bottom: 8 }}
              onClick={(e) => {
                const idx = Number((e as { activeTooltipIndex?: number | string } | null)?.activeTooltipIndex);
                if (Number.isFinite(idx) && items[idx]) handleOpenDetail(items[idx]);
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={REPORT_CHART_COLORS.gridLine} />
              <XAxis dataKey="label" stroke={REPORT_CHART_COLORS.gray} tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={12} />
              <YAxis stroke={REPORT_CHART_COLORS.gray} tick={{ fontSize: 11 }} tickFormatter={compactVnd} width={52} />
              <Tooltip
                cursor={{ fill: 'rgba(20,184,166,0.08)' }}
                labelFormatter={(_, payload) => {
                  const p = payload?.[0]?.payload as RevenueBarItem | undefined;
                  return p ? `${formatPeriod(p.period, true)} · ${p.orderCount} giao dịch` : '';
                }}
                formatter={(val, name) => [formatVnd(Number(val ?? 0)), name === 'revenue' ? 'Doanh thu' : 'Hoa hồng']}
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, border: '1px solid #D9E3E6' }}
              />
              <Legend formatter={(val) => (val === 'revenue' ? 'Doanh thu' : 'Hoa hồng')} />
              <Bar dataKey="revenue" fill={REPORT_CHART_COLORS.primary} radius={[4, 4, 0, 0]} maxBarSize={26} cursor="pointer" />
              <Bar dataKey="commission" fill={REPORT_CHART_COLORS.accent} radius={[4, 4, 0, 0]} maxBarSize={26} cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card report-table-card">
        <h4 className="table-card-title">Bảng tổng hợp doanh thu theo {groupByLabel(groupBy)} ({totals.transactionCount} giao dịch)</h4>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 56, textAlign: 'center' }}>STT</th>
                <th>Kỳ</th>
                <th style={{ textAlign: 'right' }}>Doanh thu</th>
                <th style={{ textAlign: 'right' }}>Hoa hồng nền tảng</th>
                <th style={{ textAlign: 'center' }}>Số lượng đơn</th>
                <th style={{ textAlign: 'center' }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((it, idx) => (
                <tr key={it.period} onClick={() => handleOpenDetail(it)} style={{ cursor: 'pointer' }}>
                  <td style={{ textAlign: 'center', color: 'var(--ink-400)' }}>{idx + 1}</td>
                  <td className="font-medium">{formatPeriod(it.period, true)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatVnd(it.revenue)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--color-primary-dark)' }}>{formatVnd(it.commission)}</td>
                  <td style={{ textAlign: 'center' }}>{it.orderCount}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button type="button" className="btn btn-outline btn-sm">Xem chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
