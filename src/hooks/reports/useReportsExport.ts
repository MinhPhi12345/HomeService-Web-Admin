import { useState } from 'react';
import { exportToExcel } from '../../utils/excelExport';
import { useToast } from '../../components/common/useToast';
import type {
  BookingStatusPieItem,
  ReportKey,
  RevenueBarItem,
  TaskerPerformanceBarItem,
  UserRolePieItem,
} from '../../types/reportsCenter';

export function useReportsExport() {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const toast = useToast();

  const handleExport = async (
    key: ReportKey,
    data: {
      revenueData: RevenueBarItem[];
      bookingStatusData: BookingStatusPieItem[];
      taskerData: TaskerPerformanceBarItem[];
      userRoleData: UserRolePieItem[];
    },
  ) => {
    try {
      setIsExporting(true);
      if (key === 'revenue') {
        await exportToExcel({
          fileNamePrefix: 'bao-cao-doanh-thu-nen-tang',
          sheetName: 'Doanh thu',
          columns: [
            { header: 'Chu kỳ', key: 'period', width: 22 },
            { header: 'Doanh thu', key: 'revenue', width: 22, format: 'currency' },
            { header: 'Hoa hồng', key: 'commission', width: 20, format: 'currency' },
            { header: 'Số đơn', key: 'orderCount', width: 15, format: 'number' },
          ],
          data: data.revenueData,
        });
      } else if (key === 'bookings-status') {
        await exportToExcel({
          fileNamePrefix: 'bao-cao-trang-thai-don-dat',
          sheetName: 'Trạng thái đơn',
          columns: [
            { header: 'Mã trạng thái', key: 'status', width: 18 },
            { header: 'Tên trạng thái', key: 'label', width: 26 },
            { header: 'Số lượng đơn', key: 'count', width: 18, format: 'number' },
            { header: 'Tỉ lệ (%)', key: 'percentage', width: 16, getValue: (i) => `${i.percentage}%` },
          ],
          data: data.bookingStatusData,
        });
      } else if (key === 'tasker-performance') {
        await exportToExcel({
          fileNamePrefix: 'bao-cao-hieu-suat-tasker',
          sheetName: 'Hiệu suất Tasker',
          columns: [
            { header: 'Mã Tasker', key: 'taskerId', width: 14 },
            { header: 'Họ tên Tasker', key: 'taskerName', width: 26 },
            { header: 'Đơn hoàn thành', key: 'completedCount', width: 18, format: 'number' },
            { header: 'Đơn đã hủy', key: 'cancelledCount', width: 16, format: 'number' },
            { header: 'Đánh giá', key: 'rating', width: 14, getValue: (i) => i.rating.toFixed(1) },
            { header: 'Tỉ lệ hoàn thành', key: 'completionRate', width: 20, getValue: (i) => `${i.completionRate}%` },
          ],
          data: data.taskerData,
        });
      } else if (key === 'user-roles') {
        await exportToExcel({
          fileNamePrefix: 'bao-cao-nguoi-dung-theo-vai-tro',
          sheetName: 'Phân bố người dùng',
          columns: [
            { header: 'Vai trò', key: 'roleName', width: 22 },
            { header: 'Tổng số tài khoản', key: 'count', width: 20, format: 'number' },
            { header: 'Đang hoạt động', key: 'activeCount', width: 18, format: 'number' },
            { header: 'Đã khóa', key: 'blockedCount', width: 16, format: 'number' },
            { header: 'Tỉ lệ (%)', key: 'percentage', width: 16, getValue: (i) => `${i.percentage}%` },
          ],
          data: data.userRoleData,
        });
      }
      toast.success('Xuất báo cáo Excel thành công.');
    } catch {
      toast.error('Lỗi khi xuất file Excel. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, onExport: handleExport };
}
