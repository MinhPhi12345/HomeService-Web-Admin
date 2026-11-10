import type { TaskerVerificationStatus } from './tasker';

export const UserRole = {
  Customer: 0,
  Tasker: 1,
  Admin: 2,
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

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
  // US30 (SRS v1.8)
  lockReason?: AccountLockReason | null;
  lockDetail?: string | null;
  lockedAt?: string | null;
  lockPendingAt?: string | null;
  pendingAppeals?: number;
}

export type AdminUser = AdminUserItem;

// US30 – lý do khóa tài khoản (gửi/nhận dạng số)
export const AccountLockReason = {
  Fraud: 0,
  NonPayment: 1,
  RepeatedViolations: 2,
  CustomerComplaints: 3,
  Misconduct: 4,
  Other: 5,
} as const;
export type AccountLockReason = (typeof AccountLockReason)[keyof typeof AccountLockReason];

export const LOCK_REASON_LABELS: Record<number, string> = {
  0: 'Gian lận',
  1: 'Không thanh toán',
  2: 'Vi phạm nhiều lần',
  3: 'Bị phản ánh nhiều lần',
  4: 'Hành vi không phù hợp',
  5: 'Khác',
};

/** 0 = khóa sau khi hoàn tất các đơn đang dở, 1 = khóa ngay. */
export type AccountLockMode = 0 | 1;

export interface LockAccountRequest {
  reason: AccountLockReason;
  detail: string;
  mode: AccountLockMode;
}

export interface ActiveOrderItem {
  bookingId: number;
  serviceName: string;
  status: number;
  scheduledTime: string;
  paymentMethod: number;
  immediateAction: string;
}

export interface LockPreviewResponse {
  activeOrders: ActiveOrderItem[];
  emailSubject: string;
  emailText: string;
}

export interface LockResultResponse {
  status: 'Locked' | 'Pending';
  activeOrders: number;
  actions: string[];
}
