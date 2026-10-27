import type { BadgeVariant } from '../components/common/Badge';

// NFR-16 – tên hành động trong nhật ký kiểm toán (khớp AuditService của Backend)
export const AUDIT_ACTION_LABELS: Record<string, { label: string; variant: BadgeVariant }> = {
  PaymentHeld: { label: 'Tạm giữ thanh toán', variant: 'sky' },
  Released: { label: 'Giải ngân cho Tasker', variant: 'mint' },
  CashCommission: { label: 'Thu chiết khấu tiền mặt', variant: 'peach' },
  Refund: { label: 'Hoàn tiền cho khách', variant: 'rose' },
  CancellationFee: { label: 'Phí hủy đơn', variant: 'warning' },
  Debt: { label: 'Ghi nợ khách hàng', variant: 'danger' },
  DebtPaid: { label: 'Khách trả nợ', variant: 'success' },
  DisputeResolved: { label: 'Xử lý khiếu nại', variant: 'lilac' },
  WalletTopUp: { label: 'Nạp ví Tasker', variant: 'info' },
  WalletWithdraw: { label: 'Rút tiền ví Tasker', variant: 'neutral' },
};

export function auditActionMeta(action: string) {
  return AUDIT_ACTION_LABELS[action] ?? { label: action, variant: 'neutral' as BadgeVariant };
}

const RESOLUTION_WORDS: Record<string, string> = {
  ReleaseFull: 'Bác khiếu nại',
  PartialRefund: 'Hoàn một phần',
  FullRefund: 'Hoàn toàn bộ',
  Redo: 'Làm lại miễn phí',
  EWallet: 'ví điện tử',
  Card: 'thẻ',
  Cash: 'tiền mặt',
};

/** Việt hóa các từ khóa tiếng Anh còn sót trong nội dung nhật ký do Backend ghi. */
export function prettyAuditDetail(detail?: string | null): string {
  if (!detail) return '—';
  return detail.replace(/\b(ReleaseFull|PartialRefund|FullRefund|Redo|EWallet|Card|Cash)\b/g, (w) => RESOLUTION_WORDS[w] ?? w);
}
