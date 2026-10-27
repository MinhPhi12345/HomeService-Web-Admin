import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Flame, RefreshCw, UserCheck } from 'lucide-react';
import StatCards from '../components/dashboard/StatCards';
import DailyRevenueBarChart from '../components/dashboard/DailyRevenueBarChart';
import OrderStatusProgressList from '../components/dashboard/OrderStatusProgressList';
import TaskerPerformanceTable from '../components/dashboard/TaskerPerformanceTable';
import DashboardFilter from '../components/dashboard/DashboardFilter';
import ErrorState from '../components/common/ErrorState';
import TableSkeleton from '../components/common/TableSkeleton';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAdminCounters } from '../context/useAdminCounters';
import { BOOKING_STATUS_GROUPS } from '../utils/bookingStatusLabels';
import { BookingStatus } from '../types';

export default function DashboardPage() {
  const {
    days,
    revenueReport,
    bookingsSummary,
    taskerPerformance,
    isLoading,
    error,
    updatedAt,
    onFilterChange,
    onRetry,
  } = useDashboardData();
  const { counts } = useAdminCounters();

  const countOf = (statuses: number[]) =>
    bookingsSummary.filter((b) => statuses.includes(b.status)).reduce((acc, cur) => acc + cur.count, 0);

  const groups = BOOKING_STATUS_GROUPS.map((g) => ({ ...g, count: countOf(g.statuses) }));
  const completedCount = countOf([BookingStatus.Completed, BookingStatus.Paid]);
  const cancelledCount = countOf([BookingStatus.Cancelled, BookingStatus.Rejected, BookingStatus.Expired]);
  const totalBookings = bookingsSummary.reduce((acc, cur) => acc + cur.count, 0);

  const todo = [
    { to: '/tasker-verification', label: 'Hồ sơ Tasker chờ duyệt', count: counts.pendingTaskers, icon: <UserCheck size={18} />, tone: 'sky' },
    { to: '/disputes', label: 'Khiếu nại chờ xử lý', count: counts.openDisputes, icon: <AlertTriangle size={18} />, tone: 'peach' },
    { to: '/flagged-reviews', label: 'Đánh giá bị báo cáo', count: counts.flaggedReviews, icon: <Flame size={18} />, tone: 'rose' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-toolbar">
        <DashboardFilter selectedDays={days} onChange={onFilterChange} disabled={isLoading} />
        <div className="dashboard-updated">
          {updatedAt && <span>Cập nhật lúc {updatedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>}
          <button type="button" className="btn btn-outline btn-sm" onClick={onRetry} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <div className="todo-grid">
        {todo.map((t) => (
          <Link key={t.to} to={t.to} className={`card todo-card todo-${t.tone}`}>
            <span className="todo-icon">{t.icon}</span>
            <span className="todo-text">
              <span className="todo-count">{t.count}</span>
              <span className="todo-label">{t.label}</span>
            </span>
            <ArrowRight size={16} className="todo-arrow" />
          </Link>
        ))}
      </div>

      {error && !isLoading ? (
        <ErrorState message={error} onRetry={onRetry} className="dashboard-error" />
      ) : isLoading && !revenueReport ? (
        <TableSkeleton rows={4} columns={4} />
      ) : (
        <div className={`dashboard-content ${isLoading ? 'is-refreshing' : ''}`}>
          <StatCards
            report={revenueReport}
            completedCount={completedCount}
            cancelledCount={cancelledCount}
            totalBookings={totalBookings}
            days={days}
          />

          <div className="dashboard-middle-grid">
            <DailyRevenueBarChart
              data={revenueReport?.series ?? []}
              groupBy={revenueReport?.groupBy ?? 'day'}
            />
            <OrderStatusProgressList groups={groups} total={totalBookings} />
          </div>

          <TaskerPerformanceTable data={taskerPerformance} />
        </div>
      )}
    </div>
  );
}
