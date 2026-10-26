export interface DailyRevenueItem {
  day: string;
  revenue: number;
  commission: number;
}

export interface RevenueReport {
  from: string;
  to: string;
  totalRevenue: number;
  totalCommission: number;
  transactionCount: number;
  holdingAmount?: number;
  paidToTasker?: number;
  onlineRevenue?: number;
  refundedToCustomer?: number;
  dailyData?: DailyRevenueItem[];
}

export interface BookingsSummaryItem {
  status: string;
  count: number;
}
