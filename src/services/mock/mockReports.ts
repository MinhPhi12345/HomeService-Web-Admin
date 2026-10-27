import type {
  AuditLogItem,
  BookingsSummaryItem,
  ReportBookingItem,
  RevenuePoint,
  RevenueReport,
  RevenueTransactionItem,
  TaskerPerformanceItem,
} from '../../types';

// Dữ liệu minh họa khi chạy VITE_USE_MOCK=true (không có Backend)
function mockSeries(from: string, to: string): RevenuePoint[] {
  const out: RevenuePoint[] = [];
  const cur = new Date(from);
  const end = new Date(to);
  let i = 0;
  while (cur <= end && i < 62) {
    const revenue = 3_000_000 + ((i * 7919) % 9) * 850_000;
    out.push({
      period: cur.toISOString().slice(0, 10),
      revenue,
      commission: revenue * 0.2,
      transactionCount: Math.round(revenue / 300_000),
    });
    cur.setDate(cur.getDate() + 1);
    i += 1;
  }
  return out;
}

export function getMockRevenueReport(from: string, to: string): RevenueReport {
  const series = mockSeries(from, to);
  const total = series.reduce((a, s) => a + s.revenue, 0);
  return {
    from,
    to,
    totalRevenue: total,
    totalCommission: total * 0.2,
    transactionCount: series.reduce((a, s) => a + s.transactionCount, 0),
    cashRevenue: total * 0.25,
    onlineRevenue: total * 0.75,
    heldAmount: 18_900_000,
    refundedAmount: 4_320_000,
    taskerPayout: total * 0.8,
    groupBy: 'day',
    series,
  };
}

export const mockBookingsSummary: BookingsSummaryItem[] = [
  { status: 0, count: 12 },
  { status: 3, count: 24 },
  { status: 5, count: 342 },
  { status: 6, count: 26 },
  { status: 9, count: 7 },
  { status: 11, count: 5 },
];

export function getMockBookingsSummary(_from: string, _to: string): BookingsSummaryItem[] {
  return mockBookingsSummary;
}

export const mockTaskerPerformance: TaskerPerformanceItem[] = [
  { taskerId: 3, taskerName: 'Trần Thị Hoa', completedCount: 46, cancelledCount: 1, ratingAverage: 4.9, violationPoints: 0, acceptedOffers: 50, totalOffers: 55, acceptanceRate: 0.909, noShowCount: 0, disputeCount: 0, totalEarnings: 11_040_000 },
  { taskerId: 4, taskerName: 'Lê Văn Minh', completedCount: 41, cancelledCount: 2, ratingAverage: 4.8, violationPoints: 0, acceptedOffers: 44, totalOffers: 50, acceptanceRate: 0.88, noShowCount: 0, disputeCount: 1, totalEarnings: 9_840_000 },
  { taskerId: 8, taskerName: 'Nguyễn Thu Hà', completedCount: 37, cancelledCount: 0, ratingAverage: 4.9, violationPoints: 1, acceptedOffers: 37, totalOffers: 41, acceptanceRate: 0.902, noShowCount: 0, disputeCount: 0, totalEarnings: 8_880_000 },
  { taskerId: 5, taskerName: 'Phạm Quốc Bảo', completedCount: 33, cancelledCount: 3, ratingAverage: 4.6, violationPoints: 1, acceptedOffers: 36, totalOffers: 45, acceptanceRate: 0.8, noShowCount: 1, disputeCount: 1, totalEarnings: 7_920_000 },
  { taskerId: 6, taskerName: 'Đỗ Mai Anh', completedCount: 25, cancelledCount: 1, ratingAverage: 4.7, violationPoints: 0, acceptedOffers: 26, totalOffers: 30, acceptanceRate: 0.867, noShowCount: 0, disputeCount: 0, totalEarnings: 6_000_000 },
];

export const mockReportBookings: ReportBookingItem[] = [
  { id: 1021, serviceName: 'Dọn dẹp nhà', customerName: 'Nguyễn Thị Thu', taskerName: 'Trần Thị Hoa', status: 5, paymentMethod: 1, totalPrice: 320000, scheduledTime: '2026-10-24T02:00:00Z', createdAt: '2026-10-23T08:00:00Z', address: '125 Lê Lợi, Quận 1, TP.HCM' },
  { id: 1022, serviceName: 'Vệ sinh máy lạnh', customerName: 'Trần Minh Quân', taskerName: 'Lê Văn Minh', status: 5, paymentMethod: 0, totalPrice: 450000, scheduledTime: '2026-10-24T07:00:00Z', createdAt: '2026-10-23T09:30:00Z', address: '48 Nguyễn Gia Trí, Bình Thạnh, TP.HCM' },
  { id: 1023, serviceName: 'Giặt sofa', customerName: 'Lê Thùy Dương', taskerName: null, status: 0, paymentMethod: 1, totalPrice: 650000, scheduledTime: '2026-10-27T03:00:00Z', createdAt: '2026-10-25T10:00:00Z', address: '320 CMT8, Quận 3, TP.HCM' },
];

export const mockRevenueTransactions: RevenueTransactionItem[] = mockReportBookings
  .filter((b) => b.status === 5)
  .map((b, i) => ({
    paymentId: 500 + i,
    bookingId: b.id,
    serviceName: b.serviceName,
    customerName: b.customerName,
    taskerName: b.taskerName,
    method: b.paymentMethod,
    status: 4,
    amount: b.totalPrice,
    refundedAmount: 0,
    revenue: b.totalPrice,
    commission: b.totalPrice * 0.2,
    taskerAmount: b.totalPrice * 0.8,
    at: b.scheduledTime,
  }));

export const mockAuditLogs: AuditLogItem[] = [
  { id: 3, action: 'Released', bookingId: 1021, paymentId: 500, actorUserId: 12, actorName: 'Nguyễn Thị Thu', amount: 256000, detail: 'Giải ngân khách xác nhận: Tasker 256000, chiết khấu 64000', createdAt: '2026-10-24T05:10:00Z' },
  { id: 2, action: 'CashCommission', bookingId: 1022, paymentId: 501, actorUserId: null, actorName: 'Hệ thống', amount: 90000, detail: 'Trừ chiết khấu tiền mặt vào ví Tasker', createdAt: '2026-10-24T09:40:00Z' },
  { id: 1, action: 'PaymentHeld', bookingId: 1021, paymentId: 500, actorUserId: 12, actorName: 'Nguyễn Thị Thu', amount: 320000, detail: 'Khách trả trước qua ví – hệ thống tạm giữ', createdAt: '2026-10-23T08:01:00Z' },
];
