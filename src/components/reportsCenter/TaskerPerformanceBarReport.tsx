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
import { Star } from 'lucide-react';
import type { ReportDetailPayload, TaskerPerformanceBarItem } from '../../types/reportsCenter';
import { mockTaskerJobsDetail } from '../../services/mock/mockReportsCenter';
import EmptyState from '../common/EmptyState';

interface TaskerPerformanceBarReportProps {
  items: TaskerPerformanceBarItem[];
  onSelectDetail: (payload: ReportDetailPayload) => void;
}

export default function TaskerPerformanceBarReport({
  items,
  onSelectDetail,
}: TaskerPerformanceBarReportProps) {
  if (!items || items.length === 0) {
    return <EmptyState title="Chưa có dữ liệu hiệu suất Tasker." />;
  }

  const handleOpenDetail = (tasker: TaskerPerformanceBarItem) => {
    onSelectDetail({
      reportKey: 'tasker-performance',
      title: `Chi tiết hiệu suất: ${tasker.taskerName}`,
      subtitle: `Đã hoàn thành ${tasker.completedCount} đơn (${tasker.completionRate}% hoàn tất) | Đánh giá ${tasker.rating} ★`,
      summaryStats: [
        { label: 'Họ tên Tasker', value: tasker.taskerName },
        { label: 'Đơn hoàn thành', value: `${tasker.completedCount} đơn` },
        { label: 'Đơn đã hủy', value: `${tasker.cancelledCount} đơn` },
        { label: 'Điểm vi phạm', value: `${tasker.violationPoints} điểm` },
      ],
      columns: [
        { header: 'Mã công việc', key: 'jobCode' },
        { header: 'Dịch vụ thực hiện', key: 'service' },
        { header: 'Khách hàng', key: 'customer' },
        { header: 'Thời gian hẹn', key: 'scheduled' },
        { header: 'Giá trị đơn', key: 'amount', format: 'currency' },
        { header: 'Đánh giá', key: 'rating' },
      ],
      rows: mockTaskerJobsDetail,
      isLimitedApiNotice: import.meta.env.VITE_USE_MOCK !== 'true',
    });
  };

  return (
    <div className="report-view-wrapper">
      <div className="card report-chart-card">
        <div className="chart-header-row">
          <div>
            <h3 className="chart-title">So sánh Đơn hoàn thành vs Đơn hủy theo Tasker (Bar Chart)</h3>
            <p className="chart-subtitle">Nhấp vào từng Tasker trên biểu đồ hoặc bảng để xem chi tiết công việc</p>
          </div>
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={items}
              margin={{ top: 20, right: 20, left: 0, bottom: 8 }}
              onClick={(e) => {
                const payload = (e as any)?.activePayload?.[0]?.payload as TaskerPerformanceBarItem | undefined;
                if (payload) handleOpenDetail(payload);
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="taskerName" stroke="#8CA0A8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#8CA0A8" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, border: '1px solid #D9E3E6' }}
              />
              <Legend formatter={(val) => (val === 'completedCount' ? 'Đơn hoàn thành' : 'Đơn đã hủy')} />
              <Bar dataKey="completedCount" fill="#22A06B" radius={[4, 4, 0, 0]} cursor="pointer" />
              <Bar dataKey="cancelledCount" fill="#F5605D" radius={[4, 4, 0, 0]} cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card report-table-card">
        <h4 className="table-card-title">Bảng thống kê hiệu suất Tasker</h4>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tasker</th>
                <th style={{ textAlign: 'center' }}>Hoàn thành</th>
                <th style={{ textAlign: 'center' }}>Đã hủy</th>
                <th style={{ textAlign: 'right' }}>Tỉ lệ hoàn tất</th>
                <th style={{ textAlign: 'center' }}>Đánh giá</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.taskerId} onClick={() => handleOpenDetail(t)} style={{ cursor: 'pointer' }}>
                  <td className="font-medium">{t.taskerName}</td>
                  <td style={{ textAlign: 'center', color: 'var(--success)' }}>{t.completedCount}</td>
                  <td style={{ textAlign: 'center', color: 'var(--danger)' }}>{t.cancelledCount}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{t.completionRate}%</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="rating-badge">
                      <Star size={13} fill="#FFB938" color="#FFB938" />
                      <span>{t.rating.toFixed(1)}</span>
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button type="button" className="btn btn-outline btn-sm">Xem phiếu</button>
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
