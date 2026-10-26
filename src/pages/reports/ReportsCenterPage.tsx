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

  const handleExportCurrent = () => {
    const key = activeTab === 'all' ? 'revenue' : activeTab;
    onExport(key as ReportKey, {
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
            <ReportsCenterCards onSelectReport={(key) => setActiveTab(key)} />
          )}

          {activeTab === 'revenue' && (
            <RevenueBarReport
              items={revenueData}
              totals={revenueTotals}
              onSelectDetail={setSelectedDetail}
            />
          )}

          {activeTab === 'bookings-status' && (
            <BookingsStatusPieReport
              items={bookingStatusData}
              onSelectDetail={setSelectedDetail}
            />
          )}

          {activeTab === 'tasker-performance' && (
            <TaskerPerformanceBarReport
              items={taskerData}
              onSelectDetail={setSelectedDetail}
            />
          )}

          {activeTab === 'user-roles' && (
            <UserRolesPieReport
              items={userRoleData}
              onSelectDetail={setSelectedDetail}
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
