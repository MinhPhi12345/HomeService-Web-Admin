import StatCards from '../components/dashboard/StatCards';
import DailyRevenueBarChart from '../components/dashboard/DailyRevenueBarChart';
import OrderStatusProgressList from '../components/dashboard/OrderStatusProgressList';
import TaskerPerformanceTable from '../components/dashboard/TaskerPerformanceTable';
import ErrorState from '../components/common/ErrorState';
import TableSkeleton from '../components/common/TableSkeleton';
import { useDashboardData } from '../hooks/useDashboardData';

export default function DashboardPage() {
  const {
    revenueReport,
    bookingsSummary,
    taskerPerformance,
    isLoading,
    error,
    onRetry,
  } = useDashboardData();

  const getStatusCount = (statuses: string[]) => {
    return bookingsSummary
      .filter((b) => statuses.includes(b.status))
      .reduce((acc, curr) => acc + curr.count, 0);
  };

  const completedCount = getStatusCount(['Paid', 'Completed']);
  const inProgressCount = getStatusCount(['InProgress']);
  const findingTaskerCount = getStatusCount(['Pending', 'Matched']);
  const disputedCount = getStatusCount(['Disputed']);
  const cancelledCount = getStatusCount(['Cancelled', 'Rejected']);

  if (error && !isLoading) {
    return <ErrorState message={error} onRetry={onRetry} className="dashboard-error" />;
  }

  return (
    <div className="dashboard-page">
      {isLoading && !revenueReport ? (
        <TableSkeleton rows={4} columns={4} />
      ) : (
        <div className="dashboard-content">
          <StatCards
            report={revenueReport}
            completedCount={completedCount}
            cancelledCount={cancelledCount}
          />

          <div className="dashboard-middle-grid">
            <DailyRevenueBarChart data={revenueReport?.dailyData ?? []} />
            <OrderStatusProgressList
              completed={completedCount}
              inProgress={inProgressCount}
              findingTasker={findingTaskerCount}
              disputed={disputedCount}
              cancelled={cancelledCount}
            />
          </div>

          <TaskerPerformanceTable data={taskerPerformance} />
        </div>
      )}
    </div>
  );
}
