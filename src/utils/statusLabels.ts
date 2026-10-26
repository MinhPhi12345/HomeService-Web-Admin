import {
  DisputeReason,
  DisputeResolution,
  DisputeStatus,
  TaskerVerificationStatus,
  UserRole,
} from '../types';

export * from './bookingStatusLabels';

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
