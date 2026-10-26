import apiClient from '../api';
import type {
  BookingStatusPieItem,
  RevenueBarItem,
  TaskerPerformanceBarItem,
  UserRolePieItem,
} from '../../types/reportsCenter';
import type { AdminUserItem } from '../../types';
import {
  mockBookingStatusPieData,
  mockRevenueBarData,
  mockTaskerPerformanceBarData,
  mockUserRolePieData,
} from '../mock/mockReportsCenter';
import { BOOKING_STATUS_LABELS } from '../../utils/constants';

const isMockEnabled = import.meta.env.VITE_USE_MOCK === 'true';

const STATUS_COLOR_MAP: Record<string, string> = {
  Paid: '#22A06B',
  Completed: '#14B8A6',
  InProgress: '#4C8DF6',
  Pending: '#FFB938',
  Cancelled: '#F5605D',
  Disputed: '#964817',
  Refunded: '#5B3BA2',
};

export async function getRevenueReportBarData(
  from: string,
  to: string,
): Promise<{ items: RevenueBarItem[]; totalRevenue: number; totalCommission: number; transactionCount: number }> {
  if (isMockEnabled) {
    const totalRev = mockRevenueBarData.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalCom = mockRevenueBarData.reduce((acc, curr) => acc + curr.commission, 0);
    const totalTx = mockRevenueBarData.reduce((acc, curr) => acc + curr.orderCount, 0);
    return { items: mockRevenueBarData, totalRevenue: totalRev, totalCommission: totalCom, transactionCount: totalTx };
  }

  const { data } = await apiClient.get<{
    totalRevenue: number;
    totalCommission: number;
    transactionCount: number;
  }>('/reports/revenue', { params: { from, to } });

  const singlePeriodItem: RevenueBarItem = {
    period: `${from.slice(0, 10)} - ${to.slice(0, 10)}`,
    revenue: data.totalRevenue,
    commission: data.totalCommission,
    orderCount: data.transactionCount,
  };

  return {
    items: data.transactionCount > 0 ? [singlePeriodItem] : [],
    totalRevenue: data.totalRevenue,
    totalCommission: data.totalCommission,
    transactionCount: data.transactionCount,
  };
}

export async function getBookingStatusPieData(
  from: string,
  to: string,
): Promise<BookingStatusPieItem[]> {
  if (isMockEnabled) {
    return mockBookingStatusPieData;
  }

  const { data } = await apiClient.get<{ status: string; count: number }[]>(
    '/reports/bookings-summary',
    { params: { from, to } },
  );

  const total = data.reduce((acc, curr) => acc + curr.count, 0);
  return data.map((item) => {
    const statusDef = Object.values(BOOKING_STATUS_LABELS).find((s) => s.label === item.status);
    const label = statusDef ? statusDef.label : item.status;
    const color = STATUS_COLOR_MAP[item.status] ?? '#8CA0A8';
    const percentage = total > 0 ? Number(((item.count / total) * 100).toFixed(1)) : 0;
    return { status: item.status, label, count: item.count, percentage, color };
  });
}

export async function getTaskerPerformanceBarData(): Promise<TaskerPerformanceBarItem[]> {
  if (isMockEnabled) {
    return mockTaskerPerformanceBarData;
  }

  const { data } = await apiClient.get<{
    taskerId: number;
    completedCount: number;
    cancelledCount: number;
  }[]>('/reports/tasker-performance');

  return data.map((t) => {
    const total = t.completedCount + t.cancelledCount;
    const rate = total > 0 ? Number(((t.completedCount / total) * 100).toFixed(1)) : 0;
    return {
      taskerId: t.taskerId,
      taskerName: `Tasker #${t.taskerId}`,
      completedCount: t.completedCount,
      cancelledCount: t.cancelledCount,
      rating: 5.0,
      violationPoints: 0,
      completionRate: rate,
    };
  });
}

export async function getUserRolesPieData(): Promise<UserRolePieItem[]> {
  if (isMockEnabled) {
    return mockUserRolePieData;
  }

  const { data: users } = await apiClient.get<AdminUserItem[]>('/users');
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
