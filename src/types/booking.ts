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

export const OfferStatus = {
  Sent: 0,
  Accepted: 1,
  Rejected: 2,
  Expired: 3,
  Closed: 4,
} as const;
export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus];

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
