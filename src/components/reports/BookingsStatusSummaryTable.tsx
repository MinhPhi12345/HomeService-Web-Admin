import type { BookingsSummaryItem } from '../../types';
import Badge from '../common/Badge';

interface BookingsStatusSummaryTableProps {
  items: BookingsSummaryItem[];
}

const statusLabelMap: Record<
  string,
  { label: string; variant: 'mint' | 'sky' | 'rose' | 'accent' | 'neutral' }
> = {
  Paid: { label: 'Đã hoàn tất', variant: 'mint' },
  Completed: { label: 'Đã hoàn tất', variant: 'mint' },
  InProgress: { label: 'Đang thực hiện', variant: 'sky' },
  Pending: { label: 'Đang tìm Tasker', variant: 'accent' },
  Disputed: { label: 'Đang khiếu nại', variant: 'rose' },
  Cancelled: { label: 'Đã hủy', variant: 'rose' },
  Expired: { label: 'Hết hạn', variant: 'neutral' },
};

export default function BookingsStatusSummaryTable({
  items,
}: BookingsStatusSummaryTableProps) {
  return (
    <div className="card status-summary-card">
      <div className="card-header">
        <h3 className="card-title">Số đơn theo trạng thái</h3>
      </div>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Số đơn</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const meta = statusLabelMap[it.status] ?? {
                label: it.status,
                variant: 'neutral',
              };
              return (
                <tr key={idx}>
                  <td>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {it.count.toLocaleString('vi-VN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
