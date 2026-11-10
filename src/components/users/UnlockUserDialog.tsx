import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import type { AdminUserItem } from '../../types';
import { LOCK_REASON_LABELS } from '../../types';
import { formatDateTime } from '../../utils/formatters';

interface UnlockUserDialogProps {
  user: AdminUserItem | null;
  isSubmitting: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

/** US30 – mở khóa (hoặc hủy lệnh chờ khóa); ghi chú tùy chọn được gửi trong email. */
export default function UnlockUserDialog({ user, isSubmitting, onConfirm, onCancel }: UnlockUserDialogProps) {
  const [note, setNote] = useState('');
  useEffect(() => setNote(''), [user?.id]);
  const pending = Boolean(user?.isActive && user.lockPendingAt);

  return (
    <Modal
      isOpen={Boolean(user)}
      onClose={onCancel}
      title={pending ? 'Hủy lệnh chờ khóa' : 'Mở khóa tài khoản'}
      maxWidth={520}
      footer={
        <div className="confirm-dialog-actions">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Đóng
          </Button>
          <Button type="button" variant="primary" onClick={() => onConfirm(note)} loading={isSubmitting}>
            {pending ? 'Hủy lệnh khóa' : 'Mở khóa'}
          </Button>
        </div>
      }
    >
      {user && (
        <div className="moderation-dialog">
          <div className="moderation-quote">
            <div className="moderation-quote-head">
              <b>{user.fullName}</b> · {user.email}
            </div>
            <p>
              {pending
                ? `Chờ khóa từ ${formatDateTime(user.lockPendingAt)}`
                : `Bị khóa lúc ${formatDateTime(user.lockedAt)}`}
              {user.lockReason != null && ` – ${LOCK_REASON_LABELS[user.lockReason]}`}
              {user.lockDetail && `: ${user.lockDetail}`}
            </p>
          </div>
          <div className="form-field">
            <label htmlFor="unlock-note">Ghi chú gửi người dùng (không bắt buộc)</label>
            <textarea
              id="unlock-note"
              rows={3}
              maxLength={1000}
              className="form-input"
              placeholder="VD: Đã xác minh khách thanh toán đủ khoản nợ."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <small className="field-hint">Người dùng nhận email thông báo {pending ? 'đã hủy lệnh khóa' : 'đã được mở khóa'}.</small>
          </div>
        </div>
      )}
    </Modal>
  );
}
