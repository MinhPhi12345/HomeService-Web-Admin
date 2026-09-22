import apiClient from "./api";
import type { RevenueReport } from "../types";

// EP08 - US31/US32: báo cáo doanh thu, số lượng đơn & hiệu suất Tasker
export async function getRevenueReport(from: string, to: string): Promise<RevenueReport> {
  const { data } = await apiClient.get<RevenueReport>("/reports/revenue", { params: { from, to } });
  return data;
}

export async function getBookingsSummary(from: string, to: string) {
  const { data } = await apiClient.get("/reports/bookings-summary", { params: { from, to } });
  return data;
}

export async function getTaskerPerformance() {
  const { data } = await apiClient.get("/reports/tasker-performance");
  return data;
}
