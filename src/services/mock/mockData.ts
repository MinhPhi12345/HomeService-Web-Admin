import type {
  AdminUserItem,
  AuthResponse,
  BookingsSummaryItem,
  DisputeResponse,
  PendingTaskerItem,
  RevenueReport,
  ReviewResponse,
  ServiceCategoryResponse,
  TaskerPerformanceItem,
} from '../../types';
import {
  DisputeReason,
  DisputeStatus,
  TaskerVerificationStatus,
  UserRole,
} from '../../types';

export const isMockEnabled = import.meta.env.VITE_USE_MOCK === 'true';

export function delayMock<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const mockAuthUser: AuthResponse = {
  userId: 1,
  fullName: 'Quản trị viên',
  email: 'quantri.mock@example.com',
  role: UserRole.Admin,
  accessToken: 'mock_jwt_access_token_admin',
  expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
};

export const mockServiceCategories: ServiceCategoryResponse[] = [
  {
    id: 1,
    name: 'Dọn dẹp nhà',
    description: 'Quét dọn, lau nhà, vệ sinh bếp và nhà tắm theo giờ.',
    basePrice: 150000,
    unit: 'giờ',
    iconUrl: null,
    isActive: true,
  },
  {
    id: 2,
    name: 'Giặt ủi',
    description: 'Giặt, sấy và ủi quần áo tại nhà.',
    basePrice: 80000,
    unit: 'lần',
    iconUrl: null,
    isActive: true,
  },
  {
    id: 3,
    name: 'Sửa điện nước',
    description: 'Sửa chữa điện, nước, thay thiết bị cơ bản.',
    basePrice: 200000,
    unit: 'lần',
    iconUrl: null,
    isActive: true,
  },
  {
    id: 4,
    name: 'Chăm sóc cây',
    description: 'Tưới, cắt tỉa, bón phân cây cảnh và vườn nhỏ.',
    basePrice: 120000,
    unit: 'buổi',
    iconUrl: null,
    isActive: true,
  },
  {
    id: 5,
    name: 'Nấu ăn gia đình',
    description: 'Đi chợ và nấu bữa ăn cho gia đình.',
    basePrice: 180000,
    unit: 'buổi',
    iconUrl: null,
    isActive: true,
  },
];

export const mockAdminUsers: AdminUserItem[] = [
  {
    id: 1,
    fullName: 'Quản trị viên',
    email: 'quantri.mock@example.com',
    phoneNumber: '0901234567',
    role: UserRole.Admin,
    isActive: true,
    createdAt: '2026-10-01T08:00:00.000Z',
    outstandingAmount: 0,
    isCashBlocked: false,
    unpaidReportCount: 0,
  },
  {
    id: 2,
    fullName: 'Nguyễn Văn An',
    email: 'an.nguyen@gmail.com',
    phoneNumber: '0909123456',
    role: UserRole.Customer,
    isActive: true,
    createdAt: '2026-10-05T09:30:00.000Z',
    outstandingAmount: 0,
    isCashBlocked: false,
    unpaidReportCount: 0,
  },
  {
    id: 3,
    fullName: 'Trần Thị Mai',
    email: 'mai.tran@gmail.com',
    phoneNumber: '0918234567',
    role: UserRole.Tasker,
    isActive: true,
    createdAt: '2026-10-08T14:15:00.000Z',
    outstandingAmount: 0,
    isCashBlocked: false,
    unpaidReportCount: 0,
    verificationStatus: TaskerVerificationStatus.Approved,
    ratingAverage: 4.95,
    violationPoints: 0,
    suspendedUntil: null,
  },
  {
    id: 4,
    fullName: 'Lê Hoàng Nam',
    email: 'nam.le@gmail.com',
    phoneNumber: '0933345678',
    role: UserRole.Tasker,
    isActive: true,
    createdAt: '2026-10-12T10:00:00.000Z',
    outstandingAmount: 0,
    isCashBlocked: false,
    unpaidReportCount: 0,
    verificationStatus: TaskerVerificationStatus.Pending,
    ratingAverage: 5.0,
    violationPoints: 0,
    suspendedUntil: null,
  },
  {
    id: 5,
    fullName: 'Phạm Minh Đức',
    email: 'duc.pham@gmail.com',
    phoneNumber: '0977456789',
    role: UserRole.Customer,
    isActive: false,
    createdAt: '2026-10-15T16:45:00.000Z',
    outstandingAmount: 150000,
    isCashBlocked: true,
    unpaidReportCount: 1,
  },
];

export const mockPendingTaskers: PendingTaskerItem[] = [
  {
    id: 2,
    userId: 4,
    fullName: 'Lê Hoàng Nam',
    idCardNumber: '079095012345',
    skills: 'Dọn dẹp nhà, Sửa điện nước',
    workingArea: 'Quận 1',
    email: 'nam.le@gmail.com',
    phoneNumber: '0933345678',
    idCardImageUrl: '/uploads/202610/sample_id_card.png',
    baseAddress: 'Số 123 Nguyễn Thị Minh Khai, Phường Bến Thành, Quận 1',
    baseLatitude: 10.7712,
    baseLongitude: 106.6914,
    serviceRadiusKm: 5,
    submittedAt: '2026-10-24T03:20:00.000Z',
  },
  {
    id: 3,
    userId: 6,
    fullName: 'Võ Thị Bích',
    idCardNumber: '079198054321',
    skills: 'Nấu ăn gia đình, Chăm sóc cây',
    workingArea: 'Bình Thạnh',
    email: 'bich.vo@gmail.com',
    phoneNumber: '0988567890',
    idCardImageUrl: '/uploads/202610/sample_id_card_2.png',
    baseAddress: 'Số 45 Điện Biên Phủ, Phường 15, Quận Bình Thạnh',
    baseLatitude: 10.7981,
    baseLongitude: 106.7042,
    serviceRadiusKm: 8,
    submittedAt: '2026-10-25T07:15:00.000Z',
  },
];

export const mockRevenueReport: RevenueReport = {
  from: '2026-09-26T00:00:00.000Z',
  to: '2026-10-26T00:00:00.000Z',
  totalRevenue: 28450000,
  totalCommission: 5690000,
  transactionCount: 42,
};

export const mockBookingsSummary: BookingsSummaryItem[] = [
  { status: 'Paid', count: 35 },
  { status: 'Completed', count: 4 },
  { status: 'Cancelled', count: 3 },
  { status: 'Disputed', count: 1 },
];

export const mockTaskerPerformance: TaskerPerformanceItem[] = [
  { taskerId: 3, completedCount: 28, cancelledCount: 1 },
  { taskerId: 4, completedCount: 11, cancelledCount: 2 },
];

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
