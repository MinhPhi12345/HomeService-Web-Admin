import { BookingStatus, PaymentMethod, PaymentStatus } from '../types';

export const ORDER_LABEL = 'Đơn đặt';

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
