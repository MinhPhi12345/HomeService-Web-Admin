export interface ReviewResponse {
  id: number;
  bookingId: number;
  reviewerId: number;
  reviewerName: string;
  revieweeId: number;
  rating: number;
  comment?: string | null;
  isFlagged: boolean;
  createdAt: string;
  revieweeName: string;
  /** US27 – người báo cáo, lý do và thời điểm báo cáo */
  reportReason?: string | null;
  reportedByName?: string | null;
  reportedAt?: string | null;
  /** US27 – ghi chú của Admin khi giữ lại đánh giá */
  moderationNote?: string | null;
  moderatedAt?: string | null;
}
