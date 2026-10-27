import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { BookingStatusPieItem } from '../../types/reportsCenter';
import EmptyState from '../common/EmptyState';

interface BookingsStatusPieReportProps {
  items: BookingStatusPieItem[];
  onSelect: (item: BookingStatusPieItem) => void;
}

export default function BookingsStatusPieReport({ items, onSelect }: BookingsStatusPieReportProps) {
  if (!items || items.length === 0) {
    return <EmptyState title="Chưa có dữ liệu đơn đặt trong khoảng thời gian này." />;
  }

  const totalOrders = items.reduce((acc, c) => acc + c.count, 0);
  const handleOpenDetail = (item: BookingStatusPieItem) => onSelect(item);

  return (
    <div className="report-view-wrapper">
      <div className="report-split-grid">
        <div className="card report-chart-card">
          <h3 className="chart-title">Tỷ lệ đơn đặt theo trạng thái (Pie Chart)</h3>
          <p className="chart-subtitle">Nhấn vào từng phần hình tròn để xem danh sách đơn chi tiết</p>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={items}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={3}
                  cursor="pointer"
                  onClick={(_, idx) => {
                    if (items[idx]) handleOpenDetail(items[idx]);
                  }}
                >
                  {items.map((it) => (
                    <Cell key={it.status} fill={it.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} đơn (${((Number(val ?? 0) / totalOrders) * 100).toFixed(1)}%)`, String(name)]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, border: '1px solid #D9E3E6' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card report-table-card">
          <h4 className="table-card-title">Bảng phân loại trạng thái ({totalOrders} đơn)</h4>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 56, textAlign: 'center' }}>STT</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'center' }}>Số lượng</th>
                  <th style={{ textAlign: 'right' }}>Tỉ lệ</th>
                  <th style={{ textAlign: 'center' }}>Xem</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={it.status} onClick={() => handleOpenDetail(it)} style={{ cursor: 'pointer' }}>
                    <td style={{ textAlign: 'center', color: 'var(--ink-400)' }}>{idx + 1}</td>
                    <td>
                      <div className="legend-cell">
                        <span className="legend-color-dot" style={{ backgroundColor: it.color }} />
                        <span className="font-medium">{it.label}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{it.count}</td>
                    <td style={{ textAlign: 'right' }}>{it.percentage}%</td>
                    <td style={{ textAlign: 'center' }}>
                      <button type="button" className="btn btn-outline btn-sm">Chi tiết</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
