import { Star } from 'lucide-react';
import type { TaskerPerformanceItem } from '../../types';
import EmptyState from '../common/EmptyState';

interface TaskerPerformanceTableProps {
  data: TaskerPerformanceItem[];
}

export default function TaskerPerformanceTable({
  data,
}: TaskerPerformanceTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card performance-card">
        <h3 className="chart-title">Hiệu suất Tasker (Top 5)</h3>
        <EmptyState title="Chưa có dữ liệu hiệu suất Tasker" />
      </div>
    );
  }

  return (
    <div className="card performance-card">
      <h3 className="chart-title">Hiệu suất Tasker (Top 5)</h3>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tasker</th>
              <th style={{ textAlign: 'center' }}>Hoàn thành</th>
              <th style={{ textAlign: 'center' }}>Hủy</th>
              <th style={{ textAlign: 'center' }}>Đánh giá</th>
              <th style={{ textAlign: 'center' }}>Điểm vi phạm</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 5).map((item, idx) => {
              const displayName = item.taskerName || `Tasker #${item.taskerId}`;
              const rating = item.ratingAverage ? item.ratingAverage.toFixed(1) : null;
              const violations = item.violationPoints ?? 0;

              return (
                <tr key={item.taskerId ?? idx}>
                  <td className="font-medium">{displayName}</td>
                  <td style={{ textAlign: 'center' }}>{item.completedCount}</td>
                  <td style={{ textAlign: 'center' }}>{item.cancelledCount}</td>
                  <td style={{ textAlign: 'center' }}>
                    {rating ? (
                      <span className="rating-badge">
                        <Star size={13} fill="#FFB938" color="#FFB938" />
                        <span>{rating}</span>
                      </span>
                    ) : (
                      <span className="text-muted">Chưa có</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={violations > 0 ? 'text-danger font-medium' : 'text-muted'}>{violations}</span>
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
