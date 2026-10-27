import apiClient from './api';
import type { ReviewResponse } from '../types';
import { delayMock, isMockEnabled, mockFlaggedReviews } from './mock/mockData';

// US27 - Admin kiểm duyệt đánh giá bị báo cáo
export async function getFlaggedReviews(): Promise<ReviewResponse[]> {
  if (isMockEnabled) return delayMock([...mockFlaggedReviews]);
  const { data } = await apiClient.get<ReviewResponse[]>('/reviews/flagged');
  return data;
}

/** Giữ lại đánh giá (bỏ cờ báo cáo). */
export async function keepReview(id: number): Promise<void> {
  if (isMockEnabled) {
    const idx = mockFlaggedReviews.findIndex((r) => r.id === id);
    if (idx !== -1) mockFlaggedReviews.splice(idx, 1);
    await delayMock(null);
    return;
  }
  await apiClient.put(`/reviews/${id}/flag`, null, { params: { clear: true } });
}

/** Xóa đánh giá vi phạm (điểm đánh giá của người được đánh giá được tính lại). */
export async function deleteReview(id: number): Promise<void> {
  if (isMockEnabled) {
    const idx = mockFlaggedReviews.findIndex((r) => r.id === id);
    if (idx !== -1) mockFlaggedReviews.splice(idx, 1);
    await delayMock(null);
    return;
  }
  await apiClient.delete(`/reviews/${id}`);
}
