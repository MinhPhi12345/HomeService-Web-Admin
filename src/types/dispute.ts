import type { PaymentMethod } from './booking';

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
