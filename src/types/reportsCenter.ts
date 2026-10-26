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
  period: string;
  revenue: number;
  commission: number;
  orderCount: number;
}

export interface BookingStatusPieItem {
  status: string;
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
  rating: number;
  violationPoints: number;
  completionRate: number;
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
  isLimitedApiNotice?: boolean;
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
