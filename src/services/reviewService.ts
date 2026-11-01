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
