import apiClient from './api';
import type { ReviewResponse } from '../types';
import { delayMock, isMockEnabled, mockFlaggedReviews } from './mock/mockData';

// US27 - Admin kiểm duyệt đánh giá bị báo cáo
export async function getFlaggedReviews(): Promise<ReviewResponse[]> {
  if (isMockEnabled) return delayMock([...mockFlaggedReviews]);
  const { data } = await apiClient.get<ReviewResponse[]>('/reviews/flagged');
  return data;
}

/**
 * US27 – Kiểm duyệt đánh giá bị báo cáo: giữ lại (gỡ cờ) hoặc gỡ hẳn.
 * Bắt buộc ghi lý do (≥ 10 ký tự) – Backend gửi lý do cho người báo cáo / người viết đánh giá và ghi nhật ký kiểm toán.
 */
export async function moderateReview(id: number, remove: boolean, note: string): Promise<void> {
  if (isMockEnabled) {
    const idx = mockFlaggedReviews.findIndex((r) => r.id === id);
    if (idx !== -1) mockFlaggedReviews.splice(idx, 1);
    await delayMock(null);
    return;
  }
  await apiClient.put(`/reviews/${id}/moderation`, { remove, note });
}

// Tất cả đánh giá trong 1 đơn (Admin thấy cả lý do báo cáo / kết quả kiểm duyệt) – dùng khi xem chi tiết đơn bị báo cáo
export async function getBookingReviews(bookingId: number): Promise<ReviewResponse[]> {
  if (isMockEnabled) return delayMock(mockFlaggedReviews.filter((r) => r.bookingId === bookingId));
  const { data } = await apiClient.get<ReviewResponse[]>(`/reviews/booking/${bookingId}`);
  return data;
}

/** Hồ sơ uy tín của 1 người dùng (điểm trung bình, số đánh giá, số đơn hoàn tất) */
export interface PublicProfile {
  userId: number;
  displayName: string;
  role: number;
  avatarUrl?: string | null;
  memberSince: string;
  completedBookings: number;
  reviewCount: number;
  ratingAverage?: number | null;
  isVerified?: boolean | null;
  reviews: ReviewResponse[];
}

export async function getPublicProfile(userId: number): Promise<PublicProfile | null> {
  if (isMockEnabled) return delayMock(null);
  const { data } = await apiClient.get<PublicProfile>(`/public-profiles/${userId}`);
  return data;
}
