import type {
  BookingStatusPieItem,
  RevenueBarItem,
  TaskerPerformanceBarItem,
  UserRolePieItem,
} from '../../types/reportsCenter';
import type { RevenueGroupBy } from '../../types';
import { getBookingsSummary, getRevenueReport, getTaskerPerformance } from '../reportService';
import { getUsers } from '../userService';
import { bookingStatusColor, bookingStatusLabel } from '../../utils/bookingStatusLabels';
import { fillSeries, formatPeriod, pickGroupBy, toRangeParams } from '../../utils/dateRange';

// Trung tâm báo cáo: chuyển dữ liệu API thật sang dạng dùng cho biểu đồ (from/to: yyyy-MM-dd)

export async function getRevenueReportBarData(
  from: string,
  to: string,
): Promise<{
  items: RevenueBarItem[];
  groupBy: RevenueGroupBy;
  totalRevenue: number;
  totalCommission: number;
  transactionCount: number;
}> {
  const groupBy = pickGroupBy(from, to);
  const iso = toRangeParams(from, to);
  const data = await getRevenueReport(iso.from, iso.to, groupBy);
  const series = fillSeries(data.series, from, to, groupBy);
  return {
    items: series.map((s) => ({
      period: s.period,
      label: formatPeriod(s.period),
      revenue: s.revenue,
      commission: s.commission,
      orderCount: s.transactionCount,
    })),
    groupBy,
    totalRevenue: data.totalRevenue,
    totalCommission: data.totalCommission,
    transactionCount: data.transactionCount,
  };
}

export async function getBookingStatusPieData(from: string, to: string): Promise<BookingStatusPieItem[]> {
  const iso = toRangeParams(from, to);
  const data = await getBookingsSummary(iso.from, iso.to);
  const total = data.reduce((acc, curr) => acc + curr.count, 0);
  return data
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      status: item.status,
      label: bookingStatusLabel(item.status),
      count: item.count,
      percentage: total > 0 ? Number(((item.count / total) * 100).toFixed(1)) : 0,
      color: bookingStatusColor(item.status),
    }));
}

export async function getTaskerPerformanceBarData(from: string, to: string): Promise<TaskerPerformanceBarItem[]> {
  const iso = toRangeParams(from, to);
  const data = await getTaskerPerformance(iso.from, iso.to);
  return data.map((t) => {
    const total = t.completedCount + t.cancelledCount;
    return {
      taskerId: t.taskerId,
      taskerName: t.taskerName || `Tasker #${t.taskerId}`,
      completedCount: t.completedCount,
      cancelledCount: t.cancelledCount,
      rating: t.ratingAverage ? Number(t.ratingAverage) : null,
      violationPoints: t.violationPoints ?? 0,
      completionRate: total > 0 ? Number(((t.completedCount / total) * 100).toFixed(1)) : 0,
      disputeCount: t.disputeCount ?? 0,
      acceptanceRate: t.acceptanceRate !== null && t.acceptanceRate !== undefined ? Number((t.acceptanceRate * 100).toFixed(1)) : null,
      totalEarnings: t.totalEarnings ?? 0,
    };
  });
}

export async function getUserRolesPieData(): Promise<UserRolePieItem[]> {
  const users = await getUsers();
  const total = users.length;

  const roleBuckets: Record<number, { name: string; count: number; active: number; blocked: number; color: string }> = {
    0: { name: 'Khách hàng', count: 0, active: 0, blocked: 0, color: '#14B8A6' },
    1: { name: 'Tasker', count: 0, active: 0, blocked: 0, color: '#FFB938' },
    2: { name: 'Quản trị viên', count: 0, active: 0, blocked: 0, color: '#4C8DF6' },
  };

  users.forEach((u) => {
    const bucket = roleBuckets[u.role] ?? roleBuckets[0];
    bucket.count += 1;
    if (u.isActive) bucket.active += 1;
    else bucket.blocked += 1;
  });

  return Object.entries(roleBuckets).map(([roleStr, b]) => ({
    role: Number(roleStr),
    roleName: b.name,
    count: b.count,
    activeCount: b.active,
    blockedCount: b.blocked,
    percentage: total > 0 ? Number(((b.count / total) * 100).toFixed(1)) : 0,
    color: b.color,
  }));
}
