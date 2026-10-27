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
}

export type AdminUser = AdminUserItem;
