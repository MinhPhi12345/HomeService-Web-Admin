import type { ReportMetaCard } from '../types/reportsCenter';

export const REPORT_META_CARDS: ReportMetaCard[] = [
  {
    key: 'revenue',
    title: 'Báo cáo doanh thu nền tảng',
    description: 'Thống kê tổng doanh thu, hoa hồng trích từ đơn đặt và số lượng giao dịch theo chu kỳ thời gian.',
    chartType: 'bar',
    chartTypeName: 'Biểu đồ cột (Bar Chart)',
    badgeText: 'Tài chính & Doanh thu',
    highlightValue: '189.900.000 đ',
    highlightLabel: 'Tổng doanh thu',
  },
  {
    key: 'bookings-status',
    title: 'Báo cáo trạng thái đơn đặt',
    description: 'Tỷ lệ phân bố đơn đặt theo các trạng thái: Đã thanh toán, Đang thực hiện, Đang tìm Tasker, Đã hủy...',
    chartType: 'pie',
    chartTypeName: 'Biểu đồ tròn (Pie Chart)',
    badgeText: 'Vận hành đơn hàng',
    highlightValue: '517 đơn',
    highlightLabel: 'Tổng số đơn đặt',
  },
  {
    key: 'tasker-performance',
    title: 'Báo cáo hiệu suất Tasker',
    description: 'So sánh số đơn hoàn thành, số đơn hủy, điểm đánh giá trung bình và tỷ lệ hoàn tất của các Tasker.',
    chartType: 'bar',
    chartTypeName: 'Biểu đồ cột (Bar Chart)',
    badgeText: 'Hiệu suất đối tác',
    highlightValue: '96.7%',
    highlightLabel: 'Tỉ lệ hoàn thành cao nhất',
  },
  {
    key: 'user-roles',
    title: 'Báo cáo người dùng theo vai trò',
    description: 'Cơ cấu người dùng theo vai trò Khách hàng, Tasker, Quản trị viên và tỷ lệ tài khoản hoạt động vs bị khóa.',
    chartType: 'pie',
    chartTypeName: 'Biểu đồ tròn (Pie Chart)',
    badgeText: 'Phát triển người dùng',
    highlightValue: '1.680 người',
    highlightLabel: 'Tổng tài khoản',
  },
];

export const REPORT_CHART_COLORS = {
  primary: '#14B8A6',
  accent: '#FFB938',
  info: '#4C8DF6',
  success: '#22A06B',
  danger: '#F5605D',
  purple: '#5B3BA2',
  brown: '#964817',
  gray: '#8CA0A8',
  gridLine: '#E2E8F0',
};

export const QUICK_DATE_PRESETS = [
  { label: '7 ngày qua', days: 7 },
  { label: '30 ngày qua', days: 30 },
  { label: '90 ngày qua', days: 90 },
] as const;

export const REPORT_TAB_LABELS: Record<string, string> = {
  all: 'Trung tâm báo cáo',
  revenue: 'Doanh thu',
  'bookings-status': 'Trạng thái đơn',
  'tasker-performance': 'Hiệu suất Tasker',
  'user-roles': 'Phân bố người dùng',
};
