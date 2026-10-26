import {
  BookingStatus,
  DisputeReason,
  DisputeResolution,
  DisputeStatus,
  PaymentMethod,
  PaymentStatus,
  TaskerVerificationStatus,
  UserRole,
} from '../types';

export const ORDER_LABEL = 'Đơn đặt';

export const TASKER_AVAILABILITY_LABEL = {
  AVAILABLE: 'Đang nhận đơn',
  UNAVAILABLE: 'Nghỉ nhận đơn',
} as const;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Customer]: 'Khách hàng',
  [UserRole.Tasker]: 'Tasker',
  [UserRole.Admin]: 'Quản trị viên',
};

export const TASKER_VERIFICATION_STATUS_LABELS: Record<
  TaskerVerificationStatus,
  { label: string; variant: 'warning' | 'success' | 'danger' }
> = {
  [TaskerVerificationStatus.Pending]: {
    label: 'Chờ duyệt',
    variant: 'warning',
  },
  [TaskerVerificationStatus.Approved]: {
    label: 'Đã duyệt',
    variant: 'success',
  },
  [TaskerVerificationStatus.Rejected]: {
    label: 'Từ chối',
    variant: 'danger',
  },
};

export const BOOKING_STATUS_LABELS: Record<
  BookingStatus,
  { label: string; variant: 'warning' | 'success' | 'danger' | 'neutral' }
> = {
  [BookingStatus.Pending]: {
    label: 'Đang tìm Tasker',
    variant: 'warning',
  },
  [BookingStatus.Matched]: {
    label: 'Chờ Tasker nhận',
    variant: 'warning',
  },
  [BookingStatus.Accepted]: {
    label: 'Đã nhận đơn',
    variant: 'neutral',
  },
  [BookingStatus.InProgress]: {
    label: 'Đang thực hiện',
    variant: 'neutral',
  },
  [BookingStatus.Completed]: {
    label: 'Chờ khách xác nhận',
    variant: 'warning',
  },
  [BookingStatus.Paid]: {
    label: 'Đã thanh toán',
    variant: 'success',
  },
  [BookingStatus.Cancelled]: {
    label: 'Đã hủy',
    variant: 'danger',
  },
  [BookingStatus.Rejected]: {
    label: 'Từ chối',
    variant: 'danger',
  },
  [BookingStatus.NoTaskerFound]: {
    label: 'Chưa có Tasker nhận',
    variant: 'warning',
  },
  [BookingStatus.Expired]: {
    label: 'Hết hạn',
    variant: 'danger',
  },
  [BookingStatus.AwaitingPayment]: {
    label: 'Chờ thanh toán',
    variant: 'warning',
  },
  [BookingStatus.Disputed]: {
    label: 'Đang khiếu nại',
    variant: 'danger',
  },
  [BookingStatus.Refunded]: {
    label: 'Đã hoàn tiền',
    variant: 'danger',
  },
  [BookingStatus.PaymentOverdue]: {
    label: 'Quá hạn thanh toán',
    variant: 'danger',
  },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: 'Tiền mặt',
  [PaymentMethod.EWallet]: 'Ví điện tử',
  [PaymentMethod.Card]: 'Thẻ tín dụng / Ghi nợ',
};

export const PAYMENT_STATUS_LABELS: Record<
  PaymentStatus,
  { label: string; variant: 'warning' | 'success' | 'danger' | 'neutral' }
> = {
  [PaymentStatus.Pending]: {
    label: 'Chờ thanh toán',
    variant: 'warning',
  },
  [PaymentStatus.Success]: {
    label: 'Thành công',
    variant: 'success',
  },
  [PaymentStatus.Failed]: {
    label: 'Thất bại',
    variant: 'danger',
  },
  [PaymentStatus.Held]: {
    label: 'Đang tạm giữ',
    variant: 'warning',
  },
  [PaymentStatus.Released]: {
    label: 'Đã giải ngân',
    variant: 'success',
  },
  [PaymentStatus.Refunded]: {
    label: 'Đã hoàn tiền',
    variant: 'danger',
  },
  [PaymentStatus.PartiallyRefunded]: {
    label: 'Hoàn một phần',
    variant: 'danger',
  },
};

export const DISPUTE_STATUS_LABELS: Record<
  DisputeStatus,
  { label: string; variant: 'warning' | 'success' }
> = {
  [DisputeStatus.Open]: {
    label: 'Chờ xử lý',
    variant: 'warning',
  },
  [DisputeStatus.Resolved]: {
    label: 'Đã xử lý',
    variant: 'success',
  },
};

export const DISPUTE_REASON_LABELS: Record<DisputeReason, string> = {
  [DisputeReason.PoorQuality]: 'Làm không đạt yêu cầu',
  [DisputeReason.Incomplete]: 'Làm chưa xong / thiếu hạng mục',
  [DisputeReason.PropertyDamage]: 'Làm hư hỏng tài sản',
  [DisputeReason.Behavior]: 'Thái độ không phù hợp',
  [DisputeReason.Other]: 'Khác',
};

export const DISPUTE_RESOLUTION_LABELS: Record<DisputeResolution, string> = {
  [DisputeResolution.ReleaseFull]: 'Bác khiếu nại (Chuyển đủ tiền)',
  [DisputeResolution.PartialRefund]: 'Hoàn tiền một phần',
  [DisputeResolution.FullRefund]: 'Hoàn toàn bộ tiền',
  [DisputeResolution.Redo]: 'Yêu cầu làm lại miễn phí',
};

export const SERVICE_UNITS = ['giờ', 'lần', 'm²', 'buổi'] as const;

export const WORKING_AREAS = [
  'Quận 1',
  'Quận 3',
  'Quận 4',
  'Quận 5',
  'Quận 7',
  'Quận 10',
  'Bình Thạnh',
  'Phú Nhuận',
  'Gò Vấp',
  'Tân Bình',
  'Thủ Đức',
] as const;
