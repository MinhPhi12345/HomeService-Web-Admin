import type { BookingStatus, PaymentMethod, PaymentStatus } from './booking';

// GET /api/reports/revenue – khớp RevenueReport của Backend (SRS 9.10)
export type RevenueGroupBy = 'day' | 'month' | 'year';

export interface RevenuePoint {
  period: string; // "2026-10-16" | "2026-10" | "2026" (giờ Việt Nam)
  revenue: number;
  commission: number;
  transactionCount: number;
}

export interface RevenueReport {
  from: string;
  to: string;
  totalRevenue: number;
  totalCommission: number;
  transactionCount: number;
  cashRevenue: number;
  onlineRevenue: number;
  heldAmount: number;
  refundedAmount: number;
  taskerPayout: number;
  groupBy: RevenueGroupBy;
  series: RevenuePoint[];
}

// GET /api/reports/bookings-summary – status là SỐ (enum BookingStatus)
export interface BookingsSummaryItem {
  status: BookingStatus;
  count: number;
}

// GET /api/reports/bookings – drill-down danh sách đơn
export interface ReportBookingItem {
  id: number;
  serviceName: string;
  customerName: string;
  taskerName?: string | null;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  scheduledTime: string;
  createdAt: string;
  address: string;
}

// GET /api/reports/revenue/transactions – drill-down giao dịch tạo nên doanh thu
export interface RevenueTransactionItem {
  paymentId: number;
  bookingId: number;
  serviceName: string;
  customerName: string;
  taskerName?: string | null;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  refundedAmount: number;
  revenue: number;
  commission: number;
  taskerAmount: number;
  at: string;
}

// GET /api/auditlogs
export interface AuditLogItem {
  id: number;
  action: string;
  bookingId?: number | null;
  paymentId?: number | null;
  actorUserId?: number | null;
  actorName: string;
  amount: number;
  detail?: string | null;
  createdAt: string;
}
