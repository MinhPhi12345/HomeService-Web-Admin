import apiClient from './api';
import type { BookingResponse } from '../types';
import { delayMock, isMockEnabled } from './mock/mockData';

// Admin xem chi tiết 1 đơn (dùng trong màn khiếu nại)
export async function getBookingById(id: number): Promise<BookingResponse | null> {
  if (isMockEnabled) return delayMock(null);
  const { data } = await apiClient.get<BookingResponse>(`/bookings/${id}`);
  return data;
}
