import { useReportsCenterData } from '../../hooks/reports/useReportsCenterData';
import { useReportsExport } from '../../hooks/reports/useReportsExport';
import ReportsCenterCards from '../../components/reportsCenter/ReportsCenterCards';
import ReportsFilterBar from '../../components/reportsCenter/ReportsFilterBar';
import RevenueBarReport from '../../components/reportsCenter/RevenueBarReport';
import BookingsStatusPieReport from '../../components/reportsCenter/BookingsStatusPieReport';
import TaskerPerformanceBarReport from '../../components/reportsCenter/TaskerPerformanceBarReport';
import UserRolesPieReport from '../../components/reportsCenter/UserRolesPieReport';
import ReportDetailModal from '../../components/reportsCenter/ReportDetailModal';
import PrintReportTemplate from '../../components/reportsCenter/PrintReportTemplate';
import TableSkeleton from '../../components/common/TableSkeleton';
import ErrorState from '../../components/common/ErrorState';
import { REPORT_TAB_LABELS } from '../../utils/reportsCenterConstants';
import type { ReportKey } from '../../types/reportsCenter';
import {
  buildBookingStatusDetail,
  buildRevenuePeriodDetail,
  buildTaskerDetail,
  buildUserRoleDetail,
} from '../../utils/reportDetails';
import { formatVnd } from '../../utils/formatters';
import '../../assets/reportsPrint.css';
import '../../assets/reportsCenter.css';

export default function ReportsCenterPage() {
  const {
    activeTab,
    setActiveTab,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    activePreset,
    groupBy,
    revenueData,
    revenueTotals,
    bookingStatusData,
    taskerData,
    userRoleData,
    isLoading,
    error,
    selectedDetail,
    setSelectedDetail,
    printSlip,
    onQuickPreset,
    onRetry,
    onPrintReport,
    onPrintSlip,
  } = useReportsCenterData();

  const { isExporting, onExport } = useReportsExport();
  const range = { from: dateFrom, to: dateTo };

  const totalBookings = bookingStatusData.reduce((a, c) => a + c.count, 0);
  const topTasker = [...taskerData].sort((a, b) => b.completedCount - a.completedCount)[0];
  const totalUsers = userRoleData.reduce((a, c) => a + c.count, 0);
  const highlights: Partial<Record<ReportKey, string>> = isLoading
    ? {}
    : {
        revenue: formatVnd(revenueTotals.totalRevenue),
        'bookings-status': `${totalBookings.toLocaleString('vi-VN')} đơn`,
        'tasker-performance': topTasker && topTasker.completedCount > 0 ? `${topTasker.taskerName} (${topTasker.completedCount})` : 'Chưa có',
        'user-roles': `${totalUsers.toLocaleString('vi-VN')} người`,
      };

  const handleExportCurrent = () => {
    onExport(activeTab, {
      revenueData,
      bookingStatusData,
      taskerData,
      userRoleData,
    });
  };

  return (
    <div className="admin-page reports-center-page">
      <div className="reports-nav-tabs no-print">
        {Object.entries(REPORT_TAB_LABELS).map(([tabKey, label]) => (
          <button
            key={tabKey}
            type="button"
            className={`tab-btn ${activeTab === tabKey ? 'active' : ''}`}
            onClick={() => setActiveTab(tabKey as 'all' | ReportKey)}
          >
            {label}
          </button>
        ))}
      </div>

      <ReportsFilterBar
        dateFrom={dateFrom}
        dateTo={dateTo}
        onFromChange={setDateFrom}
        onToChange={setDateTo}
        onQuickPreset={onQuickPreset}
        activePreset={activePreset}
        onPrint={onPrintReport}
        onExport={handleExportCurrent}
        onRetry={onRetry}
        isExporting={isExporting}
        showDateFilter={activeTab !== 'user-roles'}
      />

      {isLoading ? (
        <TableSkeleton rows={5} columns={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <div className="reports-content-container">
          {activeTab === 'all' && (
            <ReportsCenterCards onSelectReport={(key) => setActiveTab(key)} highlights={highlights} />
          )}

          {activeTab === 'revenue' && (
            <RevenueBarReport
              items={revenueData}
              groupBy={groupBy}
              totals={revenueTotals}
              onSelect={(item) => setSelectedDetail(buildRevenuePeriodDetail(item, range))}
            />
          )}

          {activeTab === 'bookings-status' && (
            <BookingsStatusPieReport
              items={bookingStatusData}
              onSelect={(item) => setSelectedDetail(buildBookingStatusDetail(item, range))}
            />
          )}

          {activeTab === 'tasker-performance' && (
            <TaskerPerformanceBarReport
              items={taskerData}
              onSelect={(item) => setSelectedDetail(buildTaskerDetail(item, range))}
            />
          )}

          {activeTab === 'user-roles' && (
            <UserRolesPieReport
              items={userRoleData}
              onSelect={(item) => setSelectedDetail(buildUserRoleDetail(item))}
            />
          )}
        </div>
      )}

      <ReportDetailModal
        payload={selectedDetail}
        onClose={() => setSelectedDetail(null)}
        onPrintSlip={onPrintSlip}
      />

      <PrintReportTemplate
        printSlip={printSlip}
        activeTab={activeTab}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </div>
  );
}
