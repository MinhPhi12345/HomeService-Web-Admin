import type { ReviewResponse } from '../../types';

export const mockFlaggedReviews: ReviewResponse[] = [
  {
    id: 1,
    bookingId: 88,
    reviewerId: 2,
    reviewerName: 'Nguyễn Văn An',
    revieweeId: 3,
    rating: 1,
    comment: 'Làm ăn cẩu thả, thái độ rất tệ.',
    isFlagged: true,
    createdAt: '2026-10-22T08:30:00.000Z',
    revieweeName: 'Trần Thị Mai',
  },
];
