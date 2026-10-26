export const TaskerVerificationStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
} as const;
export type TaskerVerificationStatus =
  (typeof TaskerVerificationStatus)[keyof typeof TaskerVerificationStatus];

export const WalletTransactionType = {
  TopUp: 0,
  Commission: 1,
  OnlineEarning: 2,
  Withdraw: 3,
  CancellationFee: 4,
} as const;
export type WalletTransactionType =
  (typeof WalletTransactionType)[keyof typeof WalletTransactionType];

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

export interface TaskerPerformanceItem {
  taskerId?: number | null;
  taskerName?: string | null;
  completedCount: number;
  cancelledCount: number;
  ratingAverage?: number;
  violationPoints?: number;
}
