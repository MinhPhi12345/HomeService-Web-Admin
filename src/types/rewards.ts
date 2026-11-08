// EP09 – Tasker xuất sắc tháng (FR-31) & EP10 – Khuyến mãi khách hàng (FR-32, FR-33). Khớp DTO của Backend (SRS 9.11).

export const TaskerAwardStatus = { Proposed: 0, Approved: 1, Excluded: 2 } as const;
export type TaskerAwardStatus = (typeof TaskerAwardStatus)[keyof typeof TaskerAwardStatus];

export interface TaskerAward {
  id: number;
  year: number;
  month: number;
  taskerId: number;
  taskerName: string;
  email?: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  workingArea?: string | null;
  rank: number;
  score: number; // thang 100
  completedBookings: number;
  reviewCount: number;
  ratingAverage: number;
  acceptanceRate: number; // 0–1
  onTimeRate: number; // 0–1
  disputeCount: number;
  status: TaskerAwardStatus;
  excludeReason?: string | null;
  bonusAmount: number;
  preferentialRate?: number | null; // 0.1 = 10%
  hasGift: boolean;
  giftDescription?: string | null;
  rewardCustomized: boolean;
  approvedAt?: string | null;
  bonusPaidAt?: string | null;
  preferentialFrom?: string | null;
  preferentialTo?: string | null;
  giftEmailSentAt?: string | null;
  giftInvitation?: string | null;
  giftDeliveredAt?: string | null;
}

export type AwardMonthState = 'NotComputed' | 'Proposed' | 'Approved';

export interface TaskerAwardMonth {
  year: number;
  month: number;
  state: AwardMonthState;
  monthEnded: boolean;
  computedAt?: string | null;
  approvedAt?: string | null;
  approvedByName?: string | null;
  defaultCommissionRate: number;
  items: TaskerAward[];
}

export interface UpdateTaskerAwardRequest {
  bonusAmount: number;
  preferentialRate: number | null;
  hasGift: boolean;
  giftDescription?: string | null;
}

export interface GiftInvitationRequest {
  time: string;
  place: string;
  note?: string;
}

export const VoucherDiscountType = { Percent: 0, FixedAmount: 1 } as const;
export type VoucherDiscountType = (typeof VoucherDiscountType)[keyof typeof VoucherDiscountType];

export const VoucherAudience = { AllCustomers: 0, NewCustomers: 1 } as const;
export type VoucherAudience = (typeof VoucherAudience)[keyof typeof VoucherAudience];

export const VoucherSource = { Campaign: 0, Welcome: 1, Loyalty: 2, Apology: 3 } as const;
export type VoucherSource = (typeof VoucherSource)[keyof typeof VoucherSource];

export type VoucherStatus = 'Scheduled' | 'Active' | 'Paused' | 'Ended' | 'SoldOut';

export interface VoucherAdmin {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscount?: number | null;
  minOrderValue: number;
  serviceCategoryIds: number[];
  serviceNames: string[];
  startsAt: string;
  endsAt: string;
  totalLimit?: number | null;
  perCustomerLimit: number;
  usedCount: number;
  completedCount: number;
  totalDiscount: number;
  audience: VoucherAudience;
  isPublic: boolean;
  isActive: boolean;
  status: VoucherStatus;
  createdAt: string;
}

export interface SaveVoucherRequest {
  code: string;
  name: string;
  description?: string | null;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscount?: number | null;
  minOrderValue: number;
  serviceCategoryIds: number[];
  startsAt: string;
  endsAt: string;
  totalLimit?: number | null;
  perCustomerLimit: number;
  audience: VoucherAudience;
  isPublic: boolean;
}

export interface GiftStat {
  kind: VoucherSource;
  name: string;
  granted: number;
  used: number;
  totalDiscount: number;
}

export interface PromotionSummary {
  activeCampaigns: number;
  totalCampaigns: number;
  campaignUses: number;
  campaignDiscount: number;
  giftDiscount: number;
  totalDiscount: number;
  gifts: GiftStat[];
}

export interface GiftRule {
  kind: VoucherSource;
  name: string;
  isEnabled: boolean;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscount?: number | null;
  minOrderValue: number;
  validDays: number;
  everyBookings: number;
  summary: string;
  updatedAt?: string | null;
}

export type SaveGiftRuleRequest = Omit<GiftRule, 'kind' | 'name' | 'summary' | 'updatedAt'>;
