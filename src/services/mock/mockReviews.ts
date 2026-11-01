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
    reportReason: 'Tôi làm đúng giờ, khách đã nghiệm thu và khen tại chỗ. Nhận xét này sai sự thật.',
    reportedByName: 'Trần Thị Mai',
    reportedAt: '2026-10-22T10:05:00.000Z',
  },
];
