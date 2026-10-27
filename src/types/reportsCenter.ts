export type ReportKey =
  | 'revenue'
  | 'bookings-status'
  | 'tasker-performance'
  | 'user-roles';

export interface ReportMetaCard {
  key: ReportKey;
  title: string;
  description: string;
  chartType: 'bar' | 'pie';
  chartTypeName: string;
  badgeText: string;
  highlightValue: string;
  highlightLabel: string;
}

export interface RevenueBarItem {
  period: string; // khóa kỳ từ Backend: "2026-10-16" | "2026-10" | "2026"
  label: string; // hiển thị: "16/10", "T10/2026"…
  revenue: number;
  commission: number;
  orderCount: number;
}

export interface BookingStatusPieItem {
  status: number;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TaskerPerformanceBarItem {
  taskerId: number;
  taskerName: string;
  completedCount: number;
  cancelledCount: number;
  rating: number | null;
  violationPoints: number;
  completionRate: number;
  disputeCount: number;
  acceptanceRate: number | null;
  totalEarnings: number;
}

export interface UserRolePieItem {
  role: number;
  roleName: string;
  count: number;
  activeCount: number;
  blockedCount: number;
  percentage: number;
  color: string;
}

export interface ReportDetailStat {
  label: string;
  value: string | number;
}

export interface ReportDetailColumn {
  header: string;
  key: string;
  format?: 'currency' | 'number' | 'text' | 'date';
}

export interface ReportDetailPayload {
  reportKey: ReportKey;
  title: string;
  subtitle: string;
  summaryStats: ReportDetailStat[];
  columns: ReportDetailColumn[];
  rows: Record<string, string | number>[];
  /** Tải danh sách bản ghi chi tiết từ API khi mở cửa sổ */
  loadRows?: () => Promise<Record<string, string | number>[]>;
  /** Tên file khi xuất Excel danh sách chi tiết */
  exportName?: string;
  emptyText?: string;
}

export interface PrintSlipPayload {
  slipCode: string;
  title: string;
  reportName: string;
  printedAt: string;
  metaFields: { label: string; value: string }[];
  details: { label: string; value: string }[];
  notes?: string;
}
