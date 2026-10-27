import type { BookingsSummaryItem } from '../../types';
import { bookingStatusColor, bookingStatusLabel, bookingStatusVariant } from '../../utils/bookingStatusLabels';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';

interface BookingsStatusSummaryTableProps {
  items: BookingsSummaryItem[];
}

export default function BookingsStatusSummaryTable({ items }: BookingsStatusSummaryTableProps) {
  const total = items.reduce((a, c) => a + c.count, 0);
  const sorted = [...items].sort((a, b) => b.count - a.count);

  return (
    <div className="card status-summary-card">
      <div className="card-header">
        <h3 className="card-title">Số đơn theo trạng thái</h3>
        <span className="card-hint">{total.toLocaleString('vi-VN')} đơn tạo trong kỳ</span>
      </div>
      {sorted.length === 0 ? (
        <EmptyState title="Chưa có đơn nào trong khoảng thời gian này." />
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Số đơn</th>
                <th style={{ textAlign: 'right' }}>Tỉ lệ</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((it) => (
                <tr key={it.status}>
                  <td>
                    <span className="legend-cell">
                      <span className="legend-color-dot" style={{ backgroundColor: bookingStatusColor(it.status) }} />
                      <Badge variant={bookingStatusVariant(it.status)}>{bookingStatusLabel(it.status)}</Badge>
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{it.count.toLocaleString('vi-VN')}</td>
                  <td style={{ textAlign: 'right', color: 'var(--ink-600)' }}>
                    {total > 0 ? ((it.count / total) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
