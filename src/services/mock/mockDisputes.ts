import type { DisputeResponse } from '../../types';
import { DisputeReason, DisputeStatus } from '../../types';

export const mockDisputes: DisputeResponse[] = [
  {
    id: 1,
    bookingId: 101,
    amount: 300000,
    paymentMethod: 1,
    customerName: 'Nguyễn Văn An',
    taskerName: 'Trần Thị Mai',
    reason: DisputeReason.PoorQuality,
    description: 'Dọn dẹp chưa sạch khu vực bếp và sàn nhà tắm còn ố vàng.',
    evidenceUrls: ['/uploads/202610/evidence_1.png'],
    checkInPhotoUrl: '/uploads/202610/checkin_1.png',
    checkOutPhotoUrl: '/uploads/202610/checkout_1.png',
    taskerResponse: 'Tôi đã lau kỹ 2 lần nhưng vết ố này quá lâu ngày không ra được.',
    taskerEvidenceUrls: [],
    status: DisputeStatus.Open,
    resolution: null,
    refundAmount: null,
    adminNote: null,
    createdAt: '2026-10-25T11:00:00.000Z',
    resolvedAt: null,
    customerId: 2,
    taskerId: 3,
    redoScheduledTime: null,
    taskerResponseDueAt: '2026-10-26T11:00:00.000Z',
  },
];
