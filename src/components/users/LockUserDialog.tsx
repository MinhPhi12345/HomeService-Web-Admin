import { useEffect, useState } from 'react';
import { AlertTriangle, Mail } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import type { AccountLockMode, AccountLockReason, AdminUserItem, LockPreviewResponse } from '../../types';
import { BookingStatus, LOCK_REASON_LABELS } from '../../types';
import { previewLockUser } from '../../services/userService';
import { BOOKING_STATUS_LABELS } from '../../utils/statusLabels';
import { formatDateTime } from '../../utils/formatters';

const DETAIL_MIN = 10;
const DETAIL_MAX = 1000;

interface LockUserDialogProps {
  user: AdminUserItem | null;
  isSubmitting: boolean;
  onConfirm: (reason: AccountLockReason, detail: string, mode: AccountLockMode) => void;
  onCancel: () => void;
}

/** US30 (SRS v1.8) – khóa có lý do; còn đơn đang dở thì chọn khóa sau khi hoàn tất hoặc khóa ngay. */
export default function LockUserDialog({ user, isSubmitting, onConfirm, onCancel }: LockUserDialogProps) {
  const [reason, setReason] = useState<AccountLockReason | ''>('');
  const [detail, setDetail] = useState('');
  const [mode, setMode] = useState<AccountLockMode>(0);
  const [preview, setPreview] = useState<LockPreviewResponse | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setReason('');
    setDetail('');
    setMode(0);
    setPreview(null);
    setShowEmail(false);
    setError(null);
  }, [user?.id]);

  // Xem trước danh sách đơn đang dở + nội dung email (cập nhật sau khi Admin ngừng gõ)
  useEffect(() => {
    if (!user) return;
    let ignore = false;
    const t = window.setTimeout(() => {
      previewLockUser(user.id, { reason: reason === '' ? 5 : reason, detail: detail.trim(), mode })
        .then((p) => !ignore && setPreview(p))
        .catch(() => !ignore && setPreview(null));
    }, 350);
    return () => {
      ignore = true;
      window.clearTimeout(t);
    };
  }, [user, reason, detail, mode]);

  const orders = preview?.activeOrders ?? [];
  const hasOrders = orders.length > 0;

  function submit() {
    if (reason === '') return setError('Vui lòng chọn lý do khóa.');
    const d = detail.trim();
    if (d.length < DETAIL_MIN) return setError(`Vui lòng ghi chi tiết lý do (tối thiểu ${DETAIL_MIN} ký tự).`);
    onConfirm(reason, d, hasOrders ? mode : 1);
  }

  return (
    <Modal
      isOpen={Boolean(user)}
      onClose={onCancel}
      title={`Khóa tài khoản – ${user?.fullName ?? ''}`}
      maxWidth={620}
      footer={
        <div className="confirm-dialog-actions">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="button" variant="danger" onClick={submit} loading={isSubmitting}>
            {hasOrders && mode === 0 ? 'Khóa sau khi hoàn tất đơn' : 'Khóa tài khoản'}
          </Button>
        </div>
      }
    >
      <div className="moderation-dialog lock-dialog">
        <div className="form-field">
          <label htmlFor="lock-reason">
            Lý do khóa <span className="required-star">*</span>
          </label>
          <select
            id="lock-reason"
            className="form-input"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value === '' ? '' : (Number(e.target.value) as AccountLockReason));
              setError(null);
            }}
          >
            <option value="">— Chọn lý do —</option>
            {Object.entries(LOCK_REASON_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="lock-detail">
            Chi tiết lý do (gửi trong email cho người dùng) <span className="required-star">*</span>
          </label>
          <textarea
            id="lock-detail"
            rows={3}
            maxLength={DETAIL_MAX}
            className="form-input"
            placeholder="VD: Khách đã không thanh toán đơn #125 và #131 quá 7 ngày dù đã được nhắc."
            value={detail}
            onChange={(e) => {
              setDetail(e.target.value);
              setError(null);
            }}
          />
          <small className="field-hint">
            {detail.trim().length}/{DETAIL_MAX} ký tự (tối thiểu {DETAIL_MIN}).
          </small>
        </div>

        {hasOrders ? (
          <div className="lock-orders">
            <div className="lock-orders-head">
              <AlertTriangle size={15} /> Người dùng đang có <b>{orders.length} đơn</b> chưa xong:
            </div>
            <ul className="lock-order-list">
              {orders.map((o) => (
                <li key={o.bookingId}>
                  <span className="lock-order-main">
                    Đơn #{o.bookingId} · {o.serviceName} · {formatDateTime(o.scheduledTime)} ·{' '}
                    {BOOKING_STATUS_LABELS[o.status as BookingStatus]?.label ?? 'Đang xử lý'}
                  </span>
                  {mode === 1 && <span className="lock-order-action">→ {o.immediateAction}</span>}
                </li>
              ))}
            </ul>
            <div className="lock-mode-group" role="radiogroup" aria-label="Cách khóa">
              <label className={`lock-mode ${mode === 0 ? 'active' : ''}`}>
                <input type="radio" name="lock-mode" checked={mode === 0} onChange={() => setMode(0)} />
                <span>
                  <b>Khóa sau khi hoàn tất đơn</b> (khuyên dùng)
                  <small>
                    Không nhận / đặt thêm đơn mới nhưng vẫn đăng nhập để hoàn thành các đơn trên. Hệ thống tự khóa khi đơn cuối cùng kết thúc.
                  </small>
                </span>
              </label>
              <label className={`lock-mode ${mode === 1 ? 'active' : ''}`}>
                <input type="radio" name="lock-mode" checked={mode === 1} onChange={() => setMode(1)} />
                <span>
                  <b>Khóa ngay</b> (gian lận, mất an toàn)
                  <small>Khóa ngay lập tức; hệ thống tự xử lý từng đơn như mô tả bên trên.</small>
                </span>
              </label>
            </div>
          </div>
        ) : (
          preview && <div className="field-hint">Người dùng không có đơn đang dở – tài khoản sẽ bị khóa ngay.</div>
        )}

        {preview && (
          <div className="lock-email">
            <button type="button" className="lock-email-toggle" onClick={() => setShowEmail((x) => !x)}>
              <Mail size={14} /> {showEmail ? 'Ẩn' : 'Xem trước'} email gửi người dùng: <b>{preview.emailSubject}</b>
            </button>
            {showEmail && <pre className="lock-email-body">{preview.emailText}</pre>}
          </div>
        )}

        {error && <div className="form-error-box">{error}</div>}
      </div>
    </Modal>
  );
}
