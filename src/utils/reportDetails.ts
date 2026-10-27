import type {
  BookingStatusPieItem,
  ReportDetailPayload,
  RevenueBarItem,
  TaskerPerformanceBarItem,
  UserRolePieItem,
} from '../types/reportsCenter';
import { fetchAllPages, getReportBookings, getRevenueTransactions } from '../services/reportService';
import { getUsers } from '../services/userService';
import { bookingStatusLabel, PAYMENT_METHOD_LABELS } from './bookingStatusLabels';
import { formatPeriod, toRangeParams } from './dateRange';
import { formatDate, formatDateTime, formatVnd } from './formatters';
import type { PaymentMethod, UserRole } from '../types';

export interface DateRangeInput {
  from: string; // yyyy-MM-dd
  to: string;
}

const ROLE_PARAM: Record<number, string> = { 0: 'Customer', 1: 'Tasker', 2: 'Admin' };

/** Nhấn 1 cột doanh thu → danh sách giao dịch của kỳ đó */
export function buildRevenuePeriodDetail(item: RevenueBarItem, range: DateRangeInput): ReportDetailPayload {
  // cùng khoảng lọc đã dùng để vẽ biểu đồ + period → khớp đúng số liệu của cột
  const iso = toRangeParams(range.from, range.to);
  return {
    reportKey: 'revenue',
    title: `Giao dịch kỳ ${formatPeriod(item.period, true)}`,
    subtitle: `Doanh thu ${formatVnd(item.revenue)} · Hoa hồng ${formatVnd(item.commission)} · ${item.orderCount} giao dịch`,
    summaryStats: [
      { label: 'Doanh thu', value: formatVnd(item.revenue) },
      { label: 'Hoa hồng nền tảng', value: formatVnd(item.commission) },
      { label: 'Số giao dịch', value: `${item.orderCount}` },
    ],
    columns: [
      { header: 'Mã đơn', key: 'orderCode' },
      { header: 'Khách hàng', key: 'customer' },
      { header: 'Tasker', key: 'tasker' },
      { header: 'Dịch vụ', key: 'service' },
      { header: 'Hình thức', key: 'method' },
      { header: 'Doanh thu', key: 'revenue', format: 'currency' },
      { header: 'Hoa hồng', key: 'commission', format: 'currency' },
      { header: 'Thời điểm', key: 'at' },
    ],
    rows: [],
    exportName: `giao-dich-${item.period}`,
    emptyText: 'Không có giao dịch nào trong kỳ này.',
    loadRows: async () => {
      const rows = await fetchAllPages((page, pageSize) =>
        getRevenueTransactions({ from: iso.from, to: iso.to, period: item.period, page, pageSize }),
      );
      return rows.map((r) => ({
        orderCode: `#${r.bookingId}`,
        customer: r.customerName,
        tasker: r.taskerName ?? '—',
        service: r.serviceName,
        method: PAYMENT_METHOD_LABELS[r.method as PaymentMethod] ?? '—',
        revenue: r.revenue,
        commission: r.commission,
        at: formatDateTime(r.at),
      }));
    },
  };
}

const bookingColumns = [
  { header: 'Mã đơn', key: 'orderCode' },
  { header: 'Khách hàng', key: 'customer' },
  { header: 'Tasker', key: 'tasker' },
  { header: 'Dịch vụ', key: 'service' },
  { header: 'Trạng thái', key: 'statusText' },
  { header: 'Giá trị', key: 'amount', format: 'currency' as const },
  { header: 'Ngày hẹn', key: 'scheduled' },
  { header: 'Địa chỉ', key: 'address' },
];

async function loadBookingRows(params: Parameters<typeof getReportBookings>[0]) {
  const rows = await fetchAllPages((page, pageSize) => getReportBookings({ ...params, page, pageSize }));
  return rows.map((b) => ({
    orderCode: `#${b.id}`,
    customer: b.customerName,
    tasker: b.taskerName ?? '—',
    service: b.serviceName,
    statusText: bookingStatusLabel(b.status),
    amount: b.totalPrice,
    scheduled: formatDateTime(b.scheduledTime),
    address: b.address,
  }));
}

/** Nhấn 1 lát biểu đồ tròn trạng thái → danh sách đơn có trạng thái đó */
export function buildBookingStatusDetail(item: BookingStatusPieItem, range: DateRangeInput): ReportDetailPayload {
  const iso = toRangeParams(range.from, range.to);
  return {
    reportKey: 'bookings-status',
    title: `Đơn đặt trạng thái: ${item.label}`,
    subtitle: `${item.count} đơn (${item.percentage}% số đơn tạo từ ${formatDate(iso.from)} đến ${formatDate(iso.to)})`,
    summaryStats: [
      { label: 'Trạng thái', value: item.label },
      { label: 'Số lượng đơn', value: `${item.count} đơn` },
      { label: 'Tỉ lệ', value: `${item.percentage}%` },
    ],
    columns: bookingColumns,
    rows: [],
    exportName: `don-dat-${item.label}`,
    loadRows: () => loadBookingRows({ from: iso.from, to: iso.to, status: item.status }),
  };
}

/** Nhấn 1 Tasker → các đơn Tasker đó đã nhận trong kỳ (theo ngày hẹn) */
export function buildTaskerDetail(t: TaskerPerformanceBarItem, range: DateRangeInput): ReportDetailPayload {
  const iso = toRangeParams(range.from, range.to);
  return {
    reportKey: 'tasker-performance',
    title: `Hiệu suất: ${t.taskerName}`,
    subtitle: `Hoàn thành ${t.completedCount} đơn · tỉ lệ hoàn tất ${t.completionRate}% · đánh giá ${t.rating !== null ? `${t.rating.toFixed(1)} ★` : 'chưa có'}`,
    summaryStats: [
      { label: 'Đơn hoàn thành', value: `${t.completedCount} đơn` },
      { label: 'Đơn đã hủy', value: `${t.cancelledCount} đơn` },
      { label: 'Khiếu nại', value: `${t.disputeCount}` },
      { label: 'Điểm vi phạm', value: `${t.violationPoints} điểm` },
      { label: 'Thu nhập online', value: formatVnd(t.totalEarnings) },
    ],
    columns: bookingColumns,
    rows: [],
    exportName: `cong-viec-tasker-${t.taskerId}`,
    emptyText: 'Tasker chưa nhận đơn nào trong khoảng thời gian này.',
    loadRows: () => loadBookingRows({ taskerId: t.taskerId, from: iso.from, to: iso.to }),
  };
}

/** Nhấn 1 vai trò → danh sách tài khoản thuộc vai trò */
export function buildUserRoleDetail(r: UserRolePieItem): ReportDetailPayload {
  return {
    reportKey: 'user-roles',
    title: `Nhóm người dùng: ${r.roleName}`,
    subtitle: `${r.count} tài khoản (${r.activeCount} hoạt động, ${r.blockedCount} đã khóa)`,
    summaryStats: [
      { label: 'Vai trò', value: r.roleName },
      { label: 'Tổng tài khoản', value: `${r.count}` },
      { label: 'Đang hoạt động', value: `${r.activeCount}` },
      { label: 'Đã khóa', value: `${r.blockedCount}` },
    ],
    columns: [
      { header: 'Họ tên', key: 'fullName' },
      { header: 'Email', key: 'email' },
      { header: 'Số điện thoại', key: 'phone' },
      { header: 'Trạng thái', key: 'statusText' },
      { header: 'Ngày tham gia', key: 'joinDate' },
    ],
    rows: [],
    exportName: `nguoi-dung-${ROLE_PARAM[r.role] ?? 'khac'}`,
    loadRows: async () => {
      const users = await getUsers({ role: ROLE_PARAM[r.role as UserRole] });
      return users.map((u) => ({
        fullName: u.fullName,
        email: u.email,
        phone: u.phoneNumber ?? '—',
        statusText: u.isActive ? 'Đang hoạt động' : 'Đã khóa',
        joinDate: formatDate(u.createdAt),
      }));
    },
  };
}
