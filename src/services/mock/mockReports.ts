import type {
  BookingsSummaryItem,
  DailyRevenueItem,
  RevenueReport,
  TaskerPerformanceItem,
} from '../../types';

export const mockDailyRevenue: DailyRevenueItem[] = [
  { day: '1', revenue: 4.8, commission: 0.96 },
  { day: '2', revenue: 6.5, commission: 1.3 },
  { day: '3', revenue: 5.2, commission: 1.04 },
  { day: '4', revenue: 7.9, commission: 1.58 },
  { day: '5', revenue: 8.4, commission: 1.68 },
  { day: '6', revenue: 9.8, commission: 1.96 },
  { day: '7', revenue: 8.9, commission: 1.78 },
  { day: '8', revenue: 10.5, commission: 2.1 },
  { day: '9', revenue: 11.8, commission: 2.36 },
  { day: '10', revenue: 10.2, commission: 2.04 },
  { day: '11', revenue: 12.4, commission: 2.48 },
  { day: '12', revenue: 11.1, commission: 2.22 },
  { day: '13', revenue: 10.6, commission: 2.12 },
  { day: '14', revenue: 12.8, commission: 2.56 },
  { day: '15', revenue: 13.5, commission: 2.7 },
];

export const mockRevenueReport: RevenueReport = {
  from: '2026-10-01T00:00:00.000Z',
  to: '2026-10-15T00:00:00.000Z',
  totalRevenue: 128450000,
  totalCommission: 25690000,
  transactionCount: 342,
  holdingAmount: 18900000,
  paidToTasker: 31200000,
  onlineRevenue: 97250000,
  refundedToCustomer: 4320000,
  dailyData: mockDailyRevenue,
};

export const mockBookingsSummary: BookingsSummaryItem[] = [
  { status: 'Paid', count: 342 },
  { status: 'InProgress', count: 24 },
  { status: 'Pending', count: 12 },
  { status: 'Disputed', count: 5 },
  { status: 'Cancelled', count: 26 },
  { status: 'Expired', count: 7 },
];

export const mockTaskerPerformance: TaskerPerformanceItem[] = [
  { taskerId: 3, taskerName: 'Trần Thị Hoa', completedCount: 46, cancelledCount: 1, ratingAverage: 4.9, violationPoints: 0 },
  { taskerId: 4, taskerName: 'Lê Văn Minh', completedCount: 41, cancelledCount: 2, ratingAverage: 4.8, violationPoints: 0 },
  { taskerId: 8, taskerName: 'Nguyễn Thu Hà', completedCount: 37, cancelledCount: 0, ratingAverage: 4.9, violationPoints: 1 },
  { taskerId: 5, taskerName: 'Phạm Quốc Bảo', completedCount: 33, cancelledCount: 3, ratingAverage: 4.6, violationPoints: 1 },
  { taskerId: 6, taskerName: 'Đỗ Mai Anh', completedCount: 25, cancelledCount: 1, ratingAverage: 4.7, violationPoints: 0 },
];

export function getMockRevenueReport(from: string, to: string): RevenueReport {
  return {
    ...mockRevenueReport,
    from,
    to,
  };
}

export function getMockBookingsSummary(_from: string, _to: string): BookingsSummaryItem[] {
  return mockBookingsSummary;
}
