import { useEffect, useState } from 'react';
import type { BookingsSummaryItem, RevenueReport } from '../types';
import { getBookingsSummary, getRevenueReport } from '../services/reportService';
import { useToast } from '../components/common/useToast';
import { exportToExcel } from '../utils/excelExport';
import RevenueFilterToolbar from '../components/reports/RevenueFilterToolbar';
import RevenueStatCards from '../components/reports/RevenueStatCards';
import RevenueDoubleBarChart from '../components/reports/RevenueDoubleBarChart';
import BookingsStatusSummaryTable from '../components/reports/BookingsStatusSummaryTable';
import TableSkeleton from '../components/common/TableSkeleton';
import ErrorState from '../components/common/ErrorState';

const NO_DATA = 'Chưa có dữ liệu';

export default function RevenueReportPage() {
  const toast = useToast();
  const [fromDate, setFromDate] = useState('2026-10-01');
  const [toDate, setToDate] = useState('2026-10-15');
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [summary, setSummary] = useState<BookingsSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [repData, sumData] = await Promise.all([
          getRevenueReport(fromDate, toDate),
          getBookingsSummary(fromDate, toDate),
        ]);
        if (!ignore) {
          setReport(repData);
          setSummary(sumData);
        }
      } catch {
        if (!ignore) setError('Không thể tải dữ liệu báo cáo doanh thu.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [fromDate, toDate]);

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    if (days > 0) start.setDate(end.getDate() - days);
    const toStr = end.toISOString().split('T')[0];
    const fromStr = start.toISOString().split('T')[0];
    setFromDate(fromStr);
    setToDate(toStr);
  };

  const handleExportExcel = async () => {
    if (!report) return;
    try {
      setIsExporting(true);
      const rows = [
        { label: 'Tổng doanh thu', value: report.totalRevenue, format: 'currency' },
        { label: 'Hoa hồng nền tảng', value: report.totalCommission, format: 'currency' },
        { label: 'Số giao dịch', value: report.transactionCount, format: 'number' },
        {
          label: 'Đang tạm giữ',
          value: report.holdingAmount ?? NO_DATA,
          format: typeof report.holdingAmount === 'number' ? 'currency' : 'text',
        },
        {
          label: 'Đã trả cho Tasker',
          value: report.paidToTasker ?? NO_DATA,
          format: typeof report.paidToTasker === 'number' ? 'currency' : 'text',
        },
        {
          label: 'Thu online',
          value: report.onlineRevenue ?? NO_DATA,
          format: typeof report.onlineRevenue === 'number' ? 'currency' : 'text',
        },
        {
          label: 'Đã hoàn cho khách',
          value: report.refundedToCustomer ?? NO_DATA,
          format: typeof report.refundedToCustomer === 'number' ? 'currency' : 'text',
        },
      ];

      await exportToExcel({
        fileNamePrefix: 'bao-cao-doanh-thu',
        sheetName: 'Doanh thu',
        columns: [
          { header: 'Chỉ số', key: 'label', width: 35 },
          { header: 'Giá trị', key: 'value', width: 25, format: 'currency' },
        ],
        data: rows,
      });
      toast.success('Xuất báo cáo Excel thành công.');
    } catch {
      toast.error('Lỗi khi xuất file Excel. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={() => setFromDate('2026-10-01')} />;
  }

  return (
    <div className="admin-page">
      <RevenueFilterToolbar
        fromDate={fromDate}
        toDate={toDate}
        onFromChange={setFromDate}
        onToChange={setToDate}
        onQuickSelect={handleQuickSelect}
        onExportExcel={handleExportExcel}
        isExporting={isExporting}
      />

      {loading && !report ? (
        <TableSkeleton rows={4} columns={4} />
      ) : report ? (
        <>
          <RevenueStatCards report={report} />
          <div className="revenue-content-grid">
            <RevenueDoubleBarChart data={report.dailyData ?? []} />
            <BookingsStatusSummaryTable items={summary} />
          </div>
        </>
      ) : null}
    </div>
  );
}
