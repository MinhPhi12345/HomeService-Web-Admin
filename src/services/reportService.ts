import apiClient from './api';
import type {
  BookingStatus,
  BookingsSummaryItem,
  PagedResult,
  ReportBookingItem,
  RevenueGroupBy,
  RevenueReport,
  RevenueTransactionItem,
  TaskerPerformanceItem,
} from '../types';
import {
  delayMock,
  getMockBookingsSummary,
  getMockRevenueReport,
  isMockEnabled,
  mockReportBookings,
  mockRevenueTransactions,
  mockTaskerPerformance,
} from './mock/mockData';

function paged<T>(items: T[], page = 1, pageSize = 20): PagedResult<T> {
  return { items: items.slice((page - 1) * pageSize, page * pageSize), page, pageSize, totalCount: items.length };
}

// EP08 - US31: báo cáo doanh thu (from/to ISO UTC, groupBy day|month|year)
export async function getRevenueReport(
  from: string,
  to: string,
  groupBy: RevenueGroupBy = 'day',
): Promise<RevenueReport> {
  if (isMockEnabled) {
    return delayMock(getMockRevenueReport(from, to));
  }
  const { data } = await apiClient.get<RevenueReport>('/reports/revenue', {
    params: { from, to, groupBy },
  });
  return { ...data, series: data.series ?? [] };
}

// EP08 - US32: số đơn theo trạng thái (theo ngày tạo đơn)
export async function getBookingsSummary(from: string, to: string): Promise<BookingsSummaryItem[]> {
  if (isMockEnabled) {
    return delayMock(getMockBookingsSummary(from, to));
  }
  const { data } = await apiClient.get<BookingsSummaryItem[]>('/reports/bookings-summary', {
    params: { from, to },
  });
  return data.map((d) => ({ status: Number(d.status) as BookingStatus, count: d.count }));
}

// EP08 - US32: hiệu suất Tasker (lọc theo ngày hẹn nếu truyền from/to)
export async function getTaskerPerformance(from?: string, to?: string): Promise<TaskerPerformanceItem[]> {
  if (isMockEnabled) {
    return delayMock([...mockTaskerPerformance]);
  }
  const { data } = await apiClient.get<TaskerPerformanceItem[]>('/reports/tasker-performance', {
    params: { from, to },
  });
  return data;
}

// Drill-down: giao dịch tạo nên doanh thu (period = 1 cột biểu đồ)
export async function getRevenueTransactions(params: {
  from: string;
  to: string;
  period?: string;
  page?: number;
  pageSize?: number;
}): Promise<PagedResult<RevenueTransactionItem>> {
  if (isMockEnabled) {
    return delayMock(paged(mockRevenueTransactions, params.page, params.pageSize));
  }
  const { data } = await apiClient.get<PagedResult<RevenueTransactionItem>>('/reports/revenue/transactions', {
    params,
  });
  return data;
}

// Drill-down: danh sách đơn theo trạng thái / theo Tasker
export async function getReportBookings(params: {
  from?: string;
  to?: string;
  status?: number;
  taskerId?: number;
  keyword?: string;
  page?: number;
  pageSize?: number;
}): Promise<PagedResult<ReportBookingItem>> {
  if (isMockEnabled) {
    let items = [...mockReportBookings];
    if (params.status !== undefined) items = items.filter((b) => b.status === params.status);
    return delayMock(paged(items, params.page, params.pageSize));
  }
  const { data } = await apiClient.get<PagedResult<ReportBookingItem>>('/reports/bookings', { params });
  return data;
}

/** Gọi lặp tất cả các trang (tối đa maxPages × 100 bản ghi) – dùng cho xuất Excel toàn bộ danh sách. */
export async function fetchAllPages<T>(
  load: (page: number, pageSize: number) => Promise<PagedResult<T>>,
  maxPages = 50,
): Promise<T[]> {
  const pageSize = 100;
  const first = await load(1, pageSize);
  const all = [...first.items];
  const totalPages = Math.min(Math.ceil(first.totalCount / pageSize), maxPages);
  for (let p = 2; p <= totalPages; p += 1) {
    const next = await load(p, pageSize);
    all.push(...next.items);
  }
  return all;
}
