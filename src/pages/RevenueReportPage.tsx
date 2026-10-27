import { useEffect, useState } from 'react';
import type { BookingsSummaryItem, RevenuePoint, RevenueReport } from '../types';
import {
  fetchAllPages,
  getBookingsSummary,
  getRevenueReport,
  getRevenueTransactions,
} from '../services/reportService';
import { useToast } from '../components/common/useToast';
import { exportWorkbook } from '../utils/excelExport';
import { getErrorMessage } from '../utils/errorHandler';
import { fillSeries, formatPeriod, lastDaysRange, pickGroupBy, toRangeParams } from '../utils/dateRange';
import { bookingStatusLabel, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '../utils/bookingStatusLabels';
import { formatDate, formatDateTime } from '../utils/formatters';
import { buildRevenuePeriodDetail } from '../utils/reportDetails';
import RevenueFilterToolbar from '../components/reports/RevenueFilterToolbar';
import RevenueStatCards from '../components/reports/RevenueStatCards';
import RevenueDoubleBarChart from '../components/reports/RevenueDoubleBarChart';
import BookingsStatusSummaryTable from '../components/reports/BookingsStatusSummaryTable';
import ReportDetailModal from '../components/reportsCenter/ReportDetailModal';
import TableSkeleton from '../components/common/TableSkeleton';
import ErrorState from '../components/common/ErrorState';
import type { ReportDetailPayload } from '../types/reportsCenter';
import type { PaymentMethod, PaymentStatus } from '../types';

export default function RevenueReportPage() {
  const toast = useToast();
  const initial = lastDaysRange(30);
  const [fromDate, setFromDate] = useState(initial.from);
  const [toDate, setToDate] = useState(initial.to);
  const [activePreset, setActivePreset] = useState<number | null>(30);
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [summary, setSummary] = useState<BookingsSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [detail, setDetail] = useState<ReportDetailPayload | null>(null);

  useEffect(() => {
    let ignore = false;
    const groupBy = pickGroupBy(fromDate, toDate);
    const { from, to } = toRangeParams(fromDate, toDate);
    Promise.all([getRevenueReport(from, to, groupBy), getBookingsSummary(from, to)])
      .then(([repData, sumData]) => {
        if (ignore) return;
        setReport({ ...repData, series: fillSeries(repData.series, fromDate, toDate, groupBy) });
        setSummary(sumData);
        setError(null);
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [fromDate, toDate, reload]);

  const changeRange = (from: string, to: string, preset: number | null) => {
    setLoading(true);
    setFromDate(from);
    setToDate(to);
    setActivePreset(preset);
  };

  const handleQuickSelect = (days: number) => {
    const r = lastDaysRange(days);
    changeRange(r.from, r.to, days);
  };

  const openPeriod = (p: RevenuePoint) => {
    setDetail(
      buildRevenuePeriodDetail(
        { period: p.period, label: formatPeriod(p.period), revenue: p.revenue, commission: p.commission, orderCount: p.transactionCount },
        { from: fromDate, to: toDate },
      ),
    );
  };

  // Xuất Excel: Tổng hợp + Theo kỳ + TOÀN BỘ giao dịch + Trạng thái đơn
  const handleExportExcel = async () => {
    if (!report) return;
    try {
      setIsExporting(true);
      const { from, to } = toRangeParams(fromDate, toDate);
      const transactions = await fetchAllPages((page, pageSize) => getRevenueTransactions({ from, to, page, pageSize }));
      const metrics = [
        { label: 'Khoảng thời gian', value: `${formatDate(from)} – ${formatDate(to)}` },
        { label: 'Tổng doanh thu', value: report.totalRevenue },
        { label: 'Hoa hồng nền tảng', value: report.totalCommission },
        { label: 'Số giao dịch hoàn tất', value: report.transactionCount },
        { label: 'Đã giải ngân cho Tasker', value: report.taskerPayout },
        { label: 'Thu online (ví / thẻ)', value: report.onlineRevenue },
        { label: 'Thu tiền mặt', value: report.cashRevenue },
        { label: 'Đang tạm giữ', value: report.heldAmount },
        { label: 'Đã hoàn cho khách', value: report.refundedAmount },
      ];
      await exportWorkbook('bao-cao-doanh-thu', [
        {
          sheetName: 'Tổng hợp',
          columns: [
            { header: 'Chỉ số', key: 'label', width: 32 },
            { header: 'Giá trị', key: 'value', width: 26, format: 'currency' },
          ],
          data: metrics,
        },
        {
          sheetName: 'Theo kỳ',
          columns: [
            { header: 'Kỳ', key: 'period', width: 16, getValue: (r: RevenuePoint) => formatPeriod(r.period, true) },
            { header: 'Doanh thu', key: 'revenue', width: 18, format: 'currency' },
            { header: 'Hoa hồng', key: 'commission', width: 18, format: 'currency' },
            { header: 'Số giao dịch', key: 'transactionCount', width: 14, format: 'number' },
          ],
          data: report.series,
        },
        {
          sheetName: 'Giao dịch',
          columns: [
            { header: 'Mã đơn', key: 'bookingId', width: 10, getValue: (r: (typeof transactions)[number]) => `#${r.bookingId}` },
            { header: 'Khách hàng', key: 'customerName', width: 24 },
            { header: 'Tasker', key: 'taskerName', width: 24 },
            { header: 'Dịch vụ', key: 'serviceName', width: 22 },
            {
              header: 'Hình thức',
              key: 'method',
              width: 16,
              getValue: (r: (typeof transactions)[number]) => PAYMENT_METHOD_LABELS[r.method as PaymentMethod],
            },
            {
              header: 'Trạng thái',
              key: 'status',
              width: 16,
              getValue: (r: (typeof transactions)[number]) => PAYMENT_STATUS_LABELS[r.status as PaymentStatus]?.label,
            },
            { header: 'Số tiền', key: 'amount', width: 16, format: 'currency' },
            { header: 'Đã hoàn', key: 'refundedAmount', width: 14, format: 'currency' },
            { header: 'Doanh thu', key: 'revenue', width: 16, format: 'currency' },
            { header: 'Hoa hồng', key: 'commission', width: 14, format: 'currency' },
            { header: 'Tasker nhận', key: 'taskerAmount', width: 16, format: 'currency' },
            { header: 'Thời điểm', key: 'at', width: 18, getValue: (r: (typeof transactions)[number]) => formatDateTime(r.at) },
          ],
          data: transactions,
        },
        {
          sheetName: 'Trạng thái đơn',
          columns: [
            { header: 'Trạng thái', key: 'status', width: 26, getValue: (r: BookingsSummaryItem) => bookingStatusLabel(r.status) },
            { header: 'Số đơn', key: 'count', width: 12, format: 'number' },
          ],
          data: summary,
        },
      ]);
      toast.success(`Đã xuất báo cáo Excel (${transactions.length} giao dịch).`);
    } catch {
      toast.error('Lỗi khi xuất file Excel. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="admin-page">
      <RevenueFilterToolbar
        fromDate={fromDate}
        toDate={toDate}
        activePreset={activePreset}
        onFromChange={(v) => changeRange(v, toDate, null)}
        onToChange={(v) => changeRange(fromDate, v, null)}
        onQuickSelect={handleQuickSelect}
        onExportExcel={handleExportExcel}
        isExporting={isExporting}
      />

      {error && !loading ? (
        <ErrorState
          message={error}
          onRetry={() => {
            setLoading(true);
            setReload((x) => x + 1);
          }}
        />
      ) : loading && !report ? (
        <TableSkeleton rows={4} columns={4} />
      ) : report ? (
        <div className={loading ? 'is-refreshing' : undefined}>
          <RevenueStatCards report={report} />
          <div className="revenue-content-grid">
            <RevenueDoubleBarChart data={report.series} groupBy={report.groupBy} onSelect={openPeriod} />
            <BookingsStatusSummaryTable items={summary} />
          </div>
        </div>
      ) : null}

      <ReportDetailModal payload={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
