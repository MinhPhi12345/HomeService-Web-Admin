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

// Màu phân loại trạng thái dùng cho biểu đồ tròn / chấm màu (đồng bộ với Badge)
export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  [BookingStatus.Pending]: '#FFB938',
  [BookingStatus.Matched]: '#F59E0B',
  [BookingStatus.Accepted]: '#38BDF8',
  [BookingStatus.InProgress]: '#4C8DF6',
  [BookingStatus.Completed]: '#14B8A6',
  [BookingStatus.Paid]: '#22A06B',
  [BookingStatus.Cancelled]: '#F5605D',
  [BookingStatus.Rejected]: '#E11D48',
  [BookingStatus.NoTaskerFound]: '#A3A3A3',
  [BookingStatus.Expired]: '#8CA0A8',
  [BookingStatus.AwaitingPayment]: '#A78BFA',
  [BookingStatus.Disputed]: '#C2410C',
  [BookingStatus.Refunded]: '#5B3BA2',
  [BookingStatus.PaymentOverdue]: '#9F1239',
};

export function bookingStatusLabel(status: number): string {
  return BOOKING_STATUS_LABELS[status as BookingStatus]?.label ?? `Trạng thái ${status}`;
}

export function bookingStatusColor(status: number): string {
  return BOOKING_STATUS_COLORS[status as BookingStatus] ?? '#8CA0A8';
}

export function bookingStatusVariant(status: number): 'warning' | 'success' | 'danger' | 'neutral' {
  return BOOKING_STATUS_LABELS[status as BookingStatus]?.variant ?? 'neutral';
}

/** Nhóm trạng thái dùng cho Dashboard – mọi trạng thái đều thuộc đúng 1 nhóm. */
export const BOOKING_STATUS_GROUPS: { key: string; label: string; color: string; statuses: BookingStatus[] }[] = [
  { key: 'done', label: 'Đã hoàn tất', color: '#22A06B', statuses: [BookingStatus.Completed, BookingStatus.Paid] },
  {
    key: 'doing',
    label: 'Đang thực hiện',
    color: '#4C8DF6',
    statuses: [BookingStatus.Accepted, BookingStatus.InProgress, BookingStatus.AwaitingPayment],
  },
  {
    key: 'finding',
    label: 'Đang tìm Tasker',
    color: '#FFB938',
    statuses: [BookingStatus.Pending, BookingStatus.Matched, BookingStatus.NoTaskerFound],
  },
  {
    key: 'dispute',
    label: 'Khiếu nại / hoàn tiền',
    color: '#C2410C',
    statuses: [BookingStatus.Disputed, BookingStatus.Refunded, BookingStatus.PaymentOverdue],
  },
  {
    key: 'cancel',
    label: 'Đã hủy / hết hạn',
    color: '#F5605D',
    statuses: [BookingStatus.Cancelled, BookingStatus.Rejected, BookingStatus.Expired],
  },
];
