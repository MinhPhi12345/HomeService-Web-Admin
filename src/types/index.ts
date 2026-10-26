export const UserRole = {
  Customer: 0,
  Tasker: 1,
  Admin: 2,
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const BookingStatus = {
  Pending: 0,
  Matched: 1,
  Accepted: 2,
  InProgress: 3,
  Completed: 4,
  Paid: 5,
  Cancelled: 6,
  Rejected: 7,
  NoTaskerFound: 8,
  Expired: 9,
  AwaitingPayment: 10,
  Disputed: 11,
  Refunded: 12,
  PaymentOverdue: 13,
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const PaymentMethod = {
  Cash: 0,
  EWallet: 1,
  Card: 2,
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  Pending: 0,
  Success: 1,
  Failed: 2,
  Held: 3,
  Released: 4,
  Refunded: 5,
  PartiallyRefunded: 6,
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const TaskerVerificationStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
} as const;
export type TaskerVerificationStatus =
  (typeof TaskerVerificationStatus)[keyof typeof TaskerVerificationStatus];

export const OfferStatus = {
  Sent: 0,
  Accepted: 1,
  Rejected: 2,
  Expired: 3,
  Closed: 4,
} as const;
export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus];

export const DisputeReason = {
  PoorQuality: 0,
  Incomplete: 1,
  PropertyDamage: 2,
  Behavior: 3,
  Other: 4,
} as const;
export type DisputeReason = (typeof DisputeReason)[keyof typeof DisputeReason];

export const DisputeStatus = {
  Open: 0,
  Resolved: 1,
} as const;
export type DisputeStatus = (typeof DisputeStatus)[keyof typeof DisputeStatus];

export const DisputeResolution = {
  ReleaseFull: 0,
  PartialRefund: 1,
  FullRefund: 2,
  Redo: 3,
} as const;
export type DisputeResolution =
  (typeof DisputeResolution)[keyof typeof DisputeResolution];

export const WalletTransactionType = {
  TopUp: 0,
  Commission: 1,
  OnlineEarning: 2,
  Withdraw: 3,
  CancellationFee: 4,
} as const;
export type WalletTransactionType =
  (typeof WalletTransactionType)[keyof typeof WalletTransactionType];

export interface AuthResponse {
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
  accessToken: string;
  expiresAt: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ServiceCategoryResponse {
  id: number;
  name: string;
  description?: string | null;
  basePrice: number;
  unit: string;
  iconUrl?: string | null;
  isActive: boolean;
}

export type ServiceCategory = ServiceCategoryResponse;

export interface UpsertServiceCategoryRequest {
  name: string;
  description?: string | null;
  basePrice: number;
  unit: string;
  iconUrl?: string | null;
}

export interface PendingTaskerItem {
  id: number;
  userId: number;
  fullName: string;
  idCardNumber: string;
  skills?: string | null;
  workingArea?: string | null;
  email: string;
  phoneNumber?: string | null;
  idCardImageUrl?: string | null;
  baseAddress: string;
  baseLatitude: number;
  baseLongitude: number;
  serviceRadiusKm: number;
  submittedAt?: string | null;
}

export interface AdminUserItem {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  outstandingAmount: number;
  isCashBlocked: boolean;
  unpaidReportCount: number;
  verificationStatus?: TaskerVerificationStatus | null;
  ratingAverage?: number | null;
  violationPoints?: number | null;
  suspendedUntil?: string | null;
}

export type AdminUser = AdminUserItem;

export interface BookingResponse {
  id: number;
  serviceCategoryName: string;
  customerId: number;
  customerName: string;
  taskerId?: number | null;
  taskerName?: string | null;
  scheduledTime: string;
  address: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  commissionRate: number;
  paymentMethod: PaymentMethod;
  customerPresent: boolean;
  paymentStatus?: PaymentStatus | null;
  paymentDueAt?: string | null;
  completedAt?: string | null;
  autoConfirmAt?: string | null;
  checkInPhotoUrl?: string | null;
  checkOutPhotoUrl?: string | null;
  isTaskerNoShow: boolean;
  canDispute: boolean;
  serviceCategoryId: number;
  note?: string | null;
  quantity: number;
  latitude?: number | null;
  longitude?: number | null;
  updatedAt?: string | null;
  matchRound: number;
  currentWave: number;
  cancellationFee: number;
  disputeId?: number | null;
  customerPhone?: string | null;
  taskerPhone?: string | null;
  canReview: boolean;
}

export interface DisputeResponse {
  id: number;
  bookingId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  customerName: string;
  taskerName: string;
  reason: DisputeReason;
  description: string;
  evidenceUrls: string[];
  checkInPhotoUrl?: string | null;
  checkOutPhotoUrl?: string | null;
  taskerResponse?: string | null;
  taskerEvidenceUrls: string[];
  status: DisputeStatus;
  resolution?: DisputeResolution | null;
  refundAmount?: number | null;
  adminNote?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  customerId: number;
  taskerId: number;
  redoScheduledTime?: string | null;
  taskerResponseDueAt: string;
}

export interface ResolveDisputeRequest {
  resolution: DisputeResolution;
  refundAmount?: number | null;
  redoScheduledTime?: string | null;
  adminNote: string;
}

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

export interface RevenueReport {
  from: string;
  to: string;
  totalRevenue: number;
  totalCommission: number;
  transactionCount: number;
}

export interface BookingsSummaryItem {
  status: string;
  count: number;
}

export interface TaskerPerformanceItem {
  taskerId?: number | null;
  completedCount: number;
  cancelledCount: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPage {
  items: NotificationResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  unreadCount: number;
}

export interface UploadResponse {
  url: string;
}
