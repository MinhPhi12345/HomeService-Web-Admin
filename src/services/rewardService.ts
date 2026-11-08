import apiClient from './api';
import type {
  GiftInvitationRequest,
  GiftRule,
  PromotionSummary,
  SaveGiftRuleRequest,
  SaveVoucherRequest,
  TaskerAwardMonth,
  UpdateTaskerAwardRequest,
  VoucherAdmin,
  VoucherSource,
} from '../types';

// ================= EP09 – Tasker xuất sắc tháng (FR-31) =================

export async function getAwardMonth(year?: number, month?: number): Promise<TaskerAwardMonth> {
  const { data } = await apiClient.get<TaskerAwardMonth>('/tasker-awards', { params: { year, month } });
  return data;
}

export async function computeAwardMonth(year: number, month: number): Promise<TaskerAwardMonth> {
  const { data } = await apiClient.post<TaskerAwardMonth>('/tasker-awards/compute', { year, month });
  return data;
}

export async function approveAwardMonth(year: number, month: number): Promise<TaskerAwardMonth> {
  const { data } = await apiClient.post<TaskerAwardMonth>('/tasker-awards/approve', { year, month });
  return data;
}

export async function updateAwardReward(id: number, body: UpdateTaskerAwardRequest): Promise<void> {
  await apiClient.put(`/tasker-awards/${id}`, body);
}

export async function excludeAward(id: number, reason: string): Promise<void> {
  await apiClient.post(`/tasker-awards/${id}/exclude`, { reason });
}

export async function restoreAward(id: number): Promise<void> {
  await apiClient.post(`/tasker-awards/${id}/restore`);
}

export async function sendGiftEmail(id: number, body: GiftInvitationRequest): Promise<void> {
  await apiClient.post(`/tasker-awards/${id}/gift-email`, body);
}

export async function markGiftDelivered(id: number): Promise<void> {
  await apiClient.post(`/tasker-awards/${id}/gift-delivered`);
}

/** Dữ liệu xuất Excel (có email, SĐT) – Backend ghi nhật ký kiểm toán mỗi lần gọi. */
export async function exportAwardMonth(year: number, month: number): Promise<TaskerAwardMonth> {
  const { data } = await apiClient.post<TaskerAwardMonth>('/tasker-awards/export', { year, month });
  return data;
}

// ================= EP10 – Khuyến mãi khách hàng (FR-32, FR-33) =================

export async function getVouchers(): Promise<VoucherAdmin[]> {
  const { data } = await apiClient.get<VoucherAdmin[]>('/promotions/vouchers');
  return data;
}

export async function createVoucher(body: SaveVoucherRequest): Promise<number> {
  const { data } = await apiClient.post<{ id: number }>('/promotions/vouchers', body);
  return data.id;
}

export async function updateVoucher(id: number, body: SaveVoucherRequest): Promise<void> {
  await apiClient.put(`/promotions/vouchers/${id}`, body);
}

export async function changeVoucherStatus(id: number, action: 'pause' | 'resume' | 'end'): Promise<void> {
  await apiClient.put(`/promotions/vouchers/${id}/status`, { action });
}

export async function getPromotionSummary(): Promise<PromotionSummary> {
  const { data } = await apiClient.get<PromotionSummary>('/promotions/summary');
  return data;
}

export async function getGiftRules(): Promise<GiftRule[]> {
  const { data } = await apiClient.get<GiftRule[]>('/promotions/gift-rules');
  return data;
}

export async function saveGiftRule(kind: VoucherSource, body: SaveGiftRuleRequest): Promise<GiftRule> {
  const { data } = await apiClient.put<GiftRule>(`/promotions/gift-rules/${kind}`, body);
  return data;
}
