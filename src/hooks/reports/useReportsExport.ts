import { useState } from 'react';
import { exportWorkbook, type AnyExcelSheet, type ExcelSheet } from '../../utils/excelExport';
import { formatPeriod } from '../../utils/dateRange';
import { useToast } from '../../components/common/useToast';
import type {
  BookingStatusPieItem,
  ReportKey,
  RevenueBarItem,
  TaskerPerformanceBarItem,
  UserRolePieItem,
} from '../../types/reportsCenter';

interface ExportData {
  revenueData: RevenueBarItem[];
  bookingStatusData: BookingStatusPieItem[];
  taskerData: TaskerPerformanceBarItem[];
  userRoleData: UserRolePieItem[];
}

const FILE_NAMES: Record<ReportKey | 'all', string> = {
  all: 'trung-tam-bao-cao',
  revenue: 'bao-cao-doanh-thu-nen-tang',
  'bookings-status': 'bao-cao-trang-thai-don-dat',
  'tasker-performance': 'bao-cao-hieu-suat-tasker',
  'user-roles': 'bao-cao-nguoi-dung-theo-vai-tro',
};

function buildSheets(data: ExportData): Record<ReportKey, AnyExcelSheet> {
  const revenue: ExcelSheet<RevenueBarItem> = {
    sheetName: 'Doanh thu',
    columns: [
      { header: 'Kỳ', key: 'period', width: 22, getValue: (i) => formatPeriod(i.period, true) },
      { header: 'Doanh thu', key: 'revenue', width: 22, format: 'currency' },
      { header: 'Hoa hồng', key: 'commission', width: 20, format: 'currency' },
      { header: 'Số giao dịch', key: 'orderCount', width: 15, format: 'number' },
    ],
    data: data.revenueData.filter((i) => i.orderCount > 0),
  };
  const status: ExcelSheet<BookingStatusPieItem> = {
    sheetName: 'Trạng thái đơn',
    columns: [
      { header: 'Trạng thái', key: 'label', width: 26 },
      { header: 'Số lượng đơn', key: 'count', width: 18, format: 'number' },
      { header: 'Tỉ lệ (%)', key: 'percentage', width: 16, getValue: (i) => `${i.percentage}%` },
    ],
    data: data.bookingStatusData,
  };
  const tasker: ExcelSheet<TaskerPerformanceBarItem> = {
    sheetName: 'Hiệu suất Tasker',
    columns: [
      { header: 'Mã Tasker', key: 'taskerId', width: 12 },
      { header: 'Họ tên Tasker', key: 'taskerName', width: 26 },
      { header: 'Đơn hoàn thành', key: 'completedCount', width: 16, format: 'number' },
      { header: 'Đơn đã hủy', key: 'cancelledCount', width: 14, format: 'number' },
      { header: 'Tỉ lệ hoàn thành', key: 'completionRate', width: 18, getValue: (i) => `${i.completionRate}%` },
      { header: 'Tỉ lệ nhận đơn', key: 'acceptanceRate', width: 16, getValue: (i) => (i.acceptanceRate !== null ? `${i.acceptanceRate}%` : '') },
      { header: 'Đánh giá', key: 'rating', width: 12, getValue: (i) => (i.rating !== null ? i.rating.toFixed(1) : 'Chưa có') },
      { header: 'Khiếu nại', key: 'disputeCount', width: 12, format: 'number' },
      { header: 'Điểm vi phạm', key: 'violationPoints', width: 14, format: 'number' },
      { header: 'Thu nhập online', key: 'totalEarnings', width: 18, format: 'currency' },
    ],
    data: data.taskerData,
  };
  const users: ExcelSheet<UserRolePieItem> = {
    sheetName: 'Người dùng',
    columns: [
      { header: 'Vai trò', key: 'roleName', width: 22 },
      { header: 'Tổng số tài khoản', key: 'count', width: 20, format: 'number' },
      { header: 'Đang hoạt động', key: 'activeCount', width: 18, format: 'number' },
      { header: 'Đã khóa', key: 'blockedCount', width: 16, format: 'number' },
      { header: 'Tỉ lệ (%)', key: 'percentage', width: 16, getValue: (i) => `${i.percentage}%` },
    ],
    data: data.userRoleData,
  };
  return {
    revenue: revenue,
    'bookings-status': status,
    'tasker-performance': tasker,
    'user-roles': users,
  };
}

export function useReportsExport() {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const toast = useToast();

  /** key = 'all' → 1 file gồm cả 4 báo cáo (4 sheet) */
  const handleExport = async (key: ReportKey | 'all', data: ExportData) => {
    try {
      setIsExporting(true);
      const sheets = buildSheets(data);
      const list = key === 'all' ? Object.values(sheets) : [sheets[key]];
      await exportWorkbook(FILE_NAMES[key], list);
      toast.success('Xuất báo cáo Excel thành công.');
    } catch {
      toast.error('Lỗi khi xuất file Excel. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, onExport: handleExport };
}
