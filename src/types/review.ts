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
}
