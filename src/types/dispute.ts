import type { PaymentMethod } from './booking';

export const DisputeReason = {
  PoorQuality: 0,
  Incomplete: 1,
  PropertyDamage: 2,
  Behavior: 3,
  Other: 4,
  TaskerLocked: 5,
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
  // SRS v1.8 – hạng mục & ảnh trước/sau theo hạng mục; Tasker đã bị khóa (không giao làm lại được)
  items?: BookingItemDto[] | null;
  photos?: BookingPhotoDto[] | null;
  taskerLocked?: boolean;
}

export interface BookingItemDto {
  itemNo: number;
  description: string;
}

/** stage: 0 lúc Bắt đầu, 1 lúc Hoàn thành; itemNo null = ảnh chung. */
export interface BookingPhotoDto {
  stage: 0 | 1;
  itemNo?: number | null;
  url: string;
  note?: string | null;
  createdAt: string;
}

export interface ResolveDisputeRequest {
  resolution: DisputeResolution;
  refundAmount?: number | null;
  redoScheduledTime?: string | null;
  adminNote: string;
}
