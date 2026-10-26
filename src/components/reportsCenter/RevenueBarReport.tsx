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
import type { ReportDetailPayload, RevenueBarItem } from '../../types/reportsCenter';
import { formatVnd } from '../../utils/formatters';
import { REPORT_CHART_COLORS } from '../../utils/reportsCenterConstants';
import { mockRevenueOrdersDetail } from '../../services/mock/mockReportsCenter';
import EmptyState from '../common/EmptyState';

interface RevenueBarReportProps {
  items: RevenueBarItem[];
  totals: { totalRevenue: number; totalCommission: number; transactionCount: number };
  onSelectDetail: (payload: ReportDetailPayload) => void;
}

export default function RevenueBarReport({ items, totals, onSelectDetail }: RevenueBarReportProps) {
  if (!items || items.length === 0) {
    return <EmptyState title="Chưa có dữ liệu doanh thu trong khoảng thời gian này." />;
  }

  const handleOpenDetail = (item: RevenueBarItem) => {
    onSelectDetail({
      reportKey: 'revenue',
      title: `Chi tiết doanh thu chu kỳ ${item.period}`,
      subtitle: `Doanh thu: ${formatVnd(item.revenue)} | Hoa hồng nền tảng: ${formatVnd(item.commission)} (${item.orderCount} đơn)`,
      summaryStats: [
        { label: 'Tổng doanh thu', value: formatVnd(item.revenue) },
        { label: 'Hoa hồng nền tảng', value: formatVnd(item.commission) },
        { label: 'Số giao dịch', value: `${item.orderCount} đơn` },
      ],
      columns: [
        { header: 'Mã đơn', key: 'orderCode' },
        { header: 'Khách hàng', key: 'customer' },
        { header: 'Dịch vụ', key: 'service' },
        { header: 'Giá trị đơn', key: 'amount', format: 'currency' },
        { header: 'Hoa hồng trích', key: 'commission', format: 'currency' },
        { header: 'Địa chỉ', key: 'address' },
      ],
      rows: mockRevenueOrdersDetail,
      isLimitedApiNotice: import.meta.env.VITE_USE_MOCK !== 'true',
    });
  };

  return (
    <div className="report-view-wrapper">
      <div className="card report-chart-card">
        <div className="chart-header-row">
          <div>
            <h3 className="chart-title">Biểu đồ Doanh thu & Hoa hồng nền tảng (triệu VNĐ)</h3>
            <p className="chart-subtitle">Nhấp vào từng cột để xem chi tiết các giao dịch trong chu kỳ</p>
          </div>
          <div className="chart-totals-badge">
            <span>Tổng: <strong>{formatVnd(totals.totalRevenue)}</strong></span>
            <span>Hoa hồng: <strong>{formatVnd(totals.totalCommission)}</strong></span>
          </div>
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={items.map((i) => ({ ...i, revMil: i.revenue / 1000000, comMil: i.commission / 1000000 }))}
              margin={{ top: 20, right: 20, left: 0, bottom: 8 }}
              onClick={(e) => {
                const payload = (e as any)?.activePayload?.[0]?.payload as RevenueBarItem | undefined;
                if (payload) handleOpenDetail(payload);
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={REPORT_CHART_COLORS.gridLine} />
              <XAxis dataKey="period" stroke={REPORT_CHART_COLORS.gray} tick={{ fontSize: 12 }} />
              <YAxis stroke={REPORT_CHART_COLORS.gray} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(val: any) => [`${Number(val ?? 0).toFixed(2)} tr đ`, '']}
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, border: '1px solid #D9E3E6' }}
              />
              <Legend formatter={(val) => (val === 'revMil' ? 'Doanh thu (triệu đ)' : 'Hoa hồng (triệu đ)')} />
              <Bar dataKey="revMil" fill={REPORT_CHART_COLORS.primary} radius={[4, 4, 0, 0]} cursor="pointer" />
              <Bar dataKey="comMil" fill={REPORT_CHART_COLORS.accent} radius={[4, 4, 0, 0]} cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card report-table-card">
        <h4 className="table-card-title">Bảng tổng hợp doanh thu theo chu kỳ</h4>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Chu kỳ thời gian</th>
                <th style={{ textAlign: 'right' }}>Doanh thu</th>
                <th style={{ textAlign: 'right' }}>Hoa hồng nền tảng</th>
                <th style={{ textAlign: 'center' }}>Số lượng đơn</th>
                <th style={{ textAlign: 'center' }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} onClick={() => handleOpenDetail(it)} style={{ cursor: 'pointer' }}>
                  <td className="font-medium">{it.period}</td>
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
