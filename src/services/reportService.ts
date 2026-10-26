import apiClient from './api';
import type {
  BookingsSummaryItem,
  RevenueReport,
  TaskerPerformanceItem,
} from '../types';
import {
  delayMock,
  getMockBookingsSummary,
  getMockRevenueReport,
  isMockEnabled,
  mockTaskerPerformance,
} from './mock/mockData';

// EP08 - US31/US32: báo cáo doanh thu, số lượng đơn & hiệu suất Tasker
export async function getRevenueReport(
  from: string,
  to: string,
): Promise<RevenueReport> {
  if (isMockEnabled) {
    return delayMock(getMockRevenueReport(from, to));
  }

  const { data } = await apiClient.get<RevenueReport>('/reports/revenue', {
    params: { from, to },
  });
  return data;
}

export async function getBookingsSummary(
  from: string,
  to: string,
): Promise<BookingsSummaryItem[]> {
  if (isMockEnabled) {
    return delayMock(getMockBookingsSummary(from, to));
  }

  const { data } = await apiClient.get<BookingsSummaryItem[]>(
    '/reports/bookings-summary',
    { params: { from, to } },
  );
  return data;
}

export async function getTaskerPerformance(): Promise<
  TaskerPerformanceItem[]
> {
  if (isMockEnabled) {
    return delayMock([...mockTaskerPerformance]);
  }

  const { data } = await apiClient.get<TaskerPerformanceItem[]>(
    '/reports/tasker-performance',
  );
  return data;
}
