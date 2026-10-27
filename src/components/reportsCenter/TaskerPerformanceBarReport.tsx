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
import type { TaskerPerformanceBarItem } from '../../types/reportsCenter';
import { formatVnd } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';

interface TaskerPerformanceBarReportProps {
  items: TaskerPerformanceBarItem[];
  onSelect: (item: TaskerPerformanceBarItem) => void;
}

export default function TaskerPerformanceBarReport({ items, onSelect }: TaskerPerformanceBarReportProps) {
  if (!items || items.length === 0) {
    return <EmptyState title="Chưa có dữ liệu hiệu suất Tasker." />;
  }

  const handleOpenDetail = (tasker: TaskerPerformanceBarItem) => onSelect(tasker);
  const chartItems = items.slice(0, 10);

  return (
    <div className="report-view-wrapper">
      <div className="card report-chart-card">
        <div className="chart-header-row">
          <div>
            <h3 className="chart-title">Đơn hoàn thành và đơn hủy theo Tasker (Bar Chart)</h3>
            <p className="chart-subtitle">Nhấn vào cột hoặc dòng trong bảng để xem các đơn Tasker đã nhận</p>
          </div>
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartItems}
              margin={{ top: 20, right: 20, left: 0, bottom: 8 }}
              onClick={(e) => {
                const idx = Number((e as { activeTooltipIndex?: number | string } | null)?.activeTooltipIndex);
                if (Number.isFinite(idx) && chartItems[idx]) handleOpenDetail(chartItems[idx]);
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="taskerName" stroke="#8CA0A8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#8CA0A8" tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'rgba(20,184,166,0.08)' }}
                formatter={(val, name) => [`${val} đơn`, name === 'completedCount' ? 'Hoàn thành' : 'Đã hủy']}
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, border: '1px solid #D9E3E6' }}
              />
              <Legend formatter={(val) => (val === 'completedCount' ? 'Đơn hoàn thành' : 'Đơn đã hủy')} />
              <Bar dataKey="completedCount" fill="#22A06B" radius={[4, 4, 0, 0]} maxBarSize={36} cursor="pointer" />
              <Bar dataKey="cancelledCount" fill="#F5605D" radius={[4, 4, 0, 0]} maxBarSize={36} cursor="pointer" />
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
                <th style={{ width: 56, textAlign: 'center' }}>STT</th>
                <th>Tasker</th>
                <th style={{ textAlign: 'center' }}>Hoàn thành</th>
                <th style={{ textAlign: 'center' }}>Đã hủy</th>
                <th style={{ textAlign: 'right' }}>Tỉ lệ hoàn tất</th>
                <th style={{ textAlign: 'right' }}>Nhận đơn</th>
                <th style={{ textAlign: 'center' }}>Đánh giá</th>
                <th style={{ textAlign: 'center' }}>Vi phạm</th>
                <th style={{ textAlign: 'right' }}>Thu nhập</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t, idx) => (
                <tr key={t.taskerId} onClick={() => handleOpenDetail(t)} style={{ cursor: 'pointer' }}>
                  <td style={{ textAlign: 'center', color: 'var(--ink-400)' }}>{idx + 1}</td>
                  <td className="font-medium">{t.taskerName}</td>
                  <td style={{ textAlign: 'center', color: 'var(--success)' }}>{t.completedCount}</td>
                  <td style={{ textAlign: 'center', color: 'var(--danger)' }}>{t.cancelledCount}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{t.completionRate}%</td>
                  <td style={{ textAlign: 'right' }}>{t.acceptanceRate !== null ? `${t.acceptanceRate}%` : '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    {t.rating !== null ? (
                      <span className="rating-badge">
                        <Star size={13} fill="#FFB938" color="#FFB938" />
                        <span>{t.rating.toFixed(1)}</span>
                      </span>
                    ) : (
                      <span className="text-muted">Chưa có</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={t.violationPoints > 0 ? 'text-danger font-medium' : 'text-muted'}>{t.violationPoints}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>{formatVnd(t.totalEarnings)}</td>
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
  );
}
