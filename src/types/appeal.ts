import type { AccountLockReason, UserRole } from './user';

// US48 (SRS v1.8) – yêu cầu mở khóa tài khoản
export const AppealStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
} as const;
export type AppealStatus = (typeof AppealStatus)[keyof typeof AppealStatus];

export const APPEAL_STATUS_LABELS: Record<number, { label: string; variant: 'warning' | 'mint' | 'rose' }> = {
  0: { label: 'Chờ xử lý', variant: 'warning' },
  1: { label: 'Đã chấp nhận', variant: 'mint' },
  2: { label: 'Đã từ chối', variant: 'rose' },
};

export interface AppealListItem {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
  lockReason?: AccountLockReason | null;
  lockedAt: string;
  attemptNo: number;
  status: AppealStatus;
  contentPreview: string;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface AppealHistoryItem {
  id: number;
  status: AppealStatus;
  createdAt: string;
  resolvedAt?: string | null;
  adminNote?: string | null;
}

export interface AppealUserSummary {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lockReason?: AccountLockReason | null;
  lockDetail?: string | null;
  lockedAt?: string | null;
  lockedByName?: string | null;
  outstandingAmount: number;
  isCashBlocked: boolean;
  unpaidReportCount: number;
  violationPoints?: number | null;
  ratingAverage?: number | null;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  disputesAgainst: number;
  disputesFiled: number;
}

export interface AppealDetail {
  id: number;
  status: AppealStatus;
  content: string;
  attachmentUrls: string[];
  createdAt: string;
  resolvedAt?: string | null;
  adminNote?: string | null;
  resolvedByName?: string | null;
  attemptNo: number;
  maxAttempts: number;
  user: AppealUserSummary;
  previousAppeals: AppealHistoryItem[];
}
