import type {
  BookingStatusPieItem,
  RevenueBarItem,
  TaskerPerformanceBarItem,
  UserRolePieItem,
} from '../../types/reportsCenter';

export const mockRevenueBarData: RevenueBarItem[] = [
  { period: '01/10 - 05/10', revenue: 28500000, commission: 5700000, orderCount: 78 },
  { period: '06/10 - 10/10', revenue: 34200000, commission: 6840000, orderCount: 92 },
  { period: '11/10 - 15/10', revenue: 41800000, commission: 8360000, orderCount: 115 },
  { period: '16/10 - 20/10', revenue: 38900000, commission: 7780000, orderCount: 104 },
  { period: '21/10 - 25/10', revenue: 46500000, commission: 9300000, orderCount: 128 },
];

export const mockBookingStatusPieData: BookingStatusPieItem[] = [
  { status: 'Paid', label: 'Đã thanh toán', count: 320, percentage: 61.9, color: '#22A06B' },
  { status: 'Completed', label: 'Chờ khách xác nhận', count: 48, percentage: 9.3, color: '#14B8A6' },
  { status: 'InProgress', label: 'Đang thực hiện', count: 36, percentage: 7.0, color: '#4C8DF6' },
  { status: 'Pending', label: 'Đang tìm Tasker', count: 24, percentage: 4.6, color: '#FFB938' },
  { status: 'Cancelled', label: 'Đã hủy', count: 52, percentage: 10.1, color: '#F5605D' },
  { status: 'Disputed', label: 'Đang khiếu nại', count: 12, percentage: 2.3, color: '#964817' },
  { status: 'Refunded', label: 'Đã hoàn tiền', count: 25, percentage: 4.8, color: '#5B3BA2' },
];

export const mockTaskerPerformanceBarData: TaskerPerformanceBarItem[] = [
  { taskerId: 101, taskerName: 'Nguyễn Văn An', completedCount: 58, cancelledCount: 2, rating: 4.9, violationPoints: 0, completionRate: 96.7 },
  { taskerId: 102, taskerName: 'Trần Thị Bích', completedCount: 52, cancelledCount: 1, rating: 5.0, violationPoints: 0, completionRate: 98.1 },
  { taskerId: 103, taskerName: 'Lê Hoàng Nam', completedCount: 46, cancelledCount: 4, rating: 4.7, violationPoints: 1, completionRate: 92.0 },
  { taskerId: 104, taskerName: 'Phạm Quốc Dũng', completedCount: 41, cancelledCount: 3, rating: 4.8, violationPoints: 0, completionRate: 93.2 },
  { taskerId: 105, taskerName: 'Đặng Minh Tâm', completedCount: 37, cancelledCount: 5, rating: 4.6, violationPoints: 2, completionRate: 88.1 },
];

export const mockUserRolePieData: UserRolePieItem[] = [
  { role: 0, roleName: 'Khách hàng', count: 1280, activeCount: 1245, blockedCount: 35, percentage: 76.2, color: '#14B8A6' },
  { role: 1, roleName: 'Tasker', count: 390, activeCount: 372, blockedCount: 18, percentage: 23.2, color: '#FFB938' },
  { role: 2, roleName: 'Quản trị viên', count: 10, activeCount: 10, blockedCount: 0, percentage: 0.6, color: '#4C8DF6' },
];

export const mockRevenueOrdersDetail = [
  { orderCode: 'DH-10492', customer: 'Nguyễn Thị Thu', service: 'Dọn dẹp nhà', amount: 320000, commission: 64000, address: '125 Lê Lợi, P. Bến Nghé, Quận 1, TP.HCM' },
  { orderCode: 'DH-10493', customer: 'Trần Minh Quân', service: 'Vệ sinh máy lạnh', amount: 450000, commission: 90000, address: '48 Nguyễn Gia Trí, P. 25, Q. Bình Thạnh, TP.HCM' },
  { orderCode: 'DH-10494', customer: 'Lê Thùy Dương', service: 'Giặt sofa nệm', amount: 650000, commission: 130000, address: '320 Cách Mạng Tháng 8, P. 10, Quận 3, TP.HCM' },
  { orderCode: 'DH-10495', customer: 'Phạm Đức Trọng', service: 'Sửa điện nước', amount: 280000, commission: 56000, address: '15 Quang Trung, P. 10, Q. Gò Vấp, TP.HCM' },
  { orderCode: 'DH-10496', customer: 'Vũ Ngọc Hân', service: 'Trông trẻ tại nhà', amount: 500000, commission: 100000, address: '88 Song Hành, P. An Phú, TP. Thủ Đức, TP.HCM' },
];

export const mockBookingStatusDetail = [
  { orderCode: 'DH-09821', customer: 'Bùi Tấn Phát', tasker: 'Nguyễn Văn An', statusText: 'Đã thanh toán', time: '25/10/2026 14:30', address: 'Quận 1, TP.HCM' },
  { orderCode: 'DH-09822', customer: 'Hoàng Kim Liên', tasker: 'Trần Thị Bích', statusText: 'Đã thanh toán', time: '25/10/2026 15:45', address: 'Quận Bình Thạnh, TP.HCM' },
  { orderCode: 'DH-09823', customer: 'Ngô Quốc Bảo', tasker: 'Lê Hoàng Nam', statusText: 'Đã thanh toán', time: '25/10/2026 16:10', address: 'Quận 3, TP.HCM' },
  { orderCode: 'DH-09824', customer: 'Đỗ Thảo Vy', tasker: 'Phạm Quốc Dũng', statusText: 'Đã thanh toán', time: '25/10/2026 17:00', address: 'Quận Tân Bình, TP.HCM' },
];

export const mockTaskerJobsDetail = [
  { jobCode: 'CV-8812', service: 'Dọn dẹp nhà 3 giờ', customer: 'Nguyễn Thị Thu', scheduled: '24/10/2026 09:00', amount: 240000, rating: 5 },
  { jobCode: 'CV-8813', service: 'Tổng vệ sinh sau xây dựng', customer: 'Vũ Đức Thịnh', scheduled: '24/10/2026 14:00', amount: 750000, rating: 5 },
  { jobCode: 'CV-8814', service: 'Vệ sinh rèm cửa', customer: 'Đào Bích Ngọc', scheduled: '25/10/2026 08:30', amount: 350000, rating: 4.8 },
];
