import { useCallback, useEffect, useState } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import PhotoGallery from '../components/common/PhotoGallery';
import TableSkeleton from '../components/common/TableSkeleton';
import { useToast } from '../components/common/useToast';
import { useAdminCounters } from '../context/useAdminCounters';
import { approveAppeal, getAppeal, getAppeals, rejectAppeal } from '../services/appealService';
import type { AppealDetail, AppealListItem, AppealStatus } from '../types';
import { APPEAL_STATUS_LABELS, LOCK_REASON_LABELS, UserRole } from '../types';
import { getErrorMessage } from '../utils/errorHandler';
import { formatDateTime, formatVnd } from '../utils/formatters';

const TABS: { label: string; value: AppealStatus | null }[] = [
  { label: 'Chờ xử lý', value: 0 },
  { label: 'Đã chấp nhận', value: 1 },
  { label: 'Đã từ chối', value: 2 },
  { label: 'Tất cả', value: null },
];
const NOTE_MIN = 10;
const NOTE_MAX = 1000;
const roleLabel = (r: number) => (r === UserRole.Tasker ? 'Tasker' : r === UserRole.Customer ? 'Khách hàng' : 'Admin');

/** US48 (SRS v1.8) – Admin xem và xử lý yêu cầu mở khóa tài khoản. */
export default function AccountAppealsPage() {
  const toast = useToast();
  const { refresh } = useAdminCounters();
  const [tab, setTab] = useState<AppealStatus | null>(0);
  const [items, setItems] = useState<AppealListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [detail, setDetail] = useState<AppealDetail | null>(null);
  const [opening, setOpening] = useState<number | null>(null);
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getAppeals(tab ?? undefined)
      .then((d) => !ignore && setItems(d))
      .catch(() => !ignore && toast.error('Không tải được danh sách yêu cầu mở khóa.'))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [tab, reload, toast]);

  const open = useCallback(
    async (id: number) => {
      setOpening(id);
      try {
        setDetail(await getAppeal(id));
        setDecision(null);
        setNote('');
        setNoteError(null);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setOpening(null);
      }
    },
    [toast],
  );

  async function submitDecision() {
    if (!detail || !decision) return;
    const n = note.trim();
    if (decision === 'reject' && n.length < NOTE_MIN) {
      setNoteError(`Vui lòng ghi lý do từ chối (tối thiểu ${NOTE_MIN} ký tự).`);
      return;
    }
    setSaving(true);
    try {
      if (decision === 'approve') await approveAppeal(detail.id, n);
      else await rejectAppeal(detail.id, n);
      toast.success(
        decision === 'approve'
          ? `Đã mở khóa tài khoản ${detail.user.fullName} và gửi email thông báo.`
          : `Đã từ chối yêu cầu của ${detail.user.fullName} và gửi email thông báo.`,
      );
      setDetail(null);
      setReload((x) => x + 1);
      refresh();
    } catch (err) {
      setNoteError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const u = detail?.user;

  return (
    <div className="admin-page">
      <div className="card">
        <div className="list-toolbar">
          <div className="role-tab-group">
            {TABS.map((t) => (
              <button
                key={t.label}
                type="button"
                className={`role-tab-btn ${tab === t.value ? 'active' : ''}`}
                onClick={() => setTab(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : items.length === 0 ? (
          <EmptyState title={tab === 0 ? 'Không có yêu cầu mở khóa nào đang chờ xử lý' : 'Chưa có yêu cầu nào'} />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Người gửi</th>
                  <th>Lý do bị khóa</th>
                  <th>Giải trình</th>
                  <th>Gửi lúc</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="font-medium">{a.fullName}</div>
                      <div className="cell-sub">
                        {roleLabel(a.role)} · {a.email}
                      </div>
                    </td>
                    <td>
                      <div>{a.lockReason != null ? LOCK_REASON_LABELS[a.lockReason] : '—'}</div>
                      <div className="cell-sub">Khóa {formatDateTime(a.lockedAt)}</div>
                    </td>
                    <td className="appeal-preview-cell">
                      <div className="appeal-preview">{a.contentPreview}</div>
                      <div className="cell-sub">Lần {a.attemptNo}</div>
                    </td>
                    <td>{formatDateTime(a.createdAt)}</td>
                    <td>
                      <Badge variant={APPEAL_STATUS_LABELS[a.status].variant}>{APPEAL_STATUS_LABELS[a.status].label}</Badge>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button type="button" className="btn-action-pill btn-view" onClick={() => open(a.id)} disabled={opening === a.id}>
                        {opening === a.id ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-notice-box">
        <span>
          ⓘ Người bị khóa xác thực email bằng mã OTP rồi gửi giải trình. Mỗi lần bị khóa được gửi tối đa 3 yêu cầu; bị từ chối phải
          chờ 7 ngày mới gửi lại. Chấp nhận = mở khóa tài khoản; người dùng nhận email cho cả hai kết quả.
        </span>
      </div>

      <Modal
        isOpen={Boolean(detail)}
        onClose={() => !saving && setDetail(null)}
        title={detail ? `Yêu cầu mở khóa #${detail.id} – ${detail.user.fullName}` : ''}
        maxWidth={760}
        footer={
          detail && detail.status === 0 ? (
            decision ? (
              <div className="confirm-dialog-actions">
                <Button type="button" variant="outline" onClick={() => setDecision(null)} disabled={saving}>
                  Quay lại
                </Button>
                <Button type="button" variant={decision === 'approve' ? 'primary' : 'danger'} onClick={submitDecision} loading={saving}>
                  {decision === 'approve' ? 'Xác nhận mở khóa' : 'Xác nhận từ chối'}
                </Button>
              </div>
            ) : (
              <div className="confirm-dialog-actions">
                <Button type="button" variant="outline" onClick={() => setDecision('reject')}>
                  Từ chối
                </Button>
                <Button type="button" variant="primary" onClick={() => setDecision('approve')}>
                  Chấp nhận & mở khóa
                </Button>
              </div>
            )
          ) : (
            <div className="confirm-dialog-actions">
              <Button type="button" variant="outline" onClick={() => setDetail(null)}>
                Đóng
              </Button>
            </div>
          )
        }
      >
        {detail && u && (
          <div className="appeal-detail">
            <div className="appeal-grid">
              <section className="appeal-box">
                <h4>Tài khoản</h4>
                <dl>
                  <dt>Vai trò</dt>
                  <dd>{roleLabel(u.role)}</dd>
                  <dt>Email · SĐT</dt>
                  <dd>
                    {u.email} · {u.phoneNumber ?? '—'}
                  </dd>
                  <dt>Ngày tạo</dt>
                  <dd>{formatDateTime(u.createdAt)}</dd>
                  <dt>Đơn</dt>
                  <dd>
                    {u.totalBookings} đơn · {u.completedBookings} hoàn tất · {u.cancelledBookings} hủy
                  </dd>
                  <dt>Khiếu nại</dt>
                  <dd>
                    {u.role === UserRole.Tasker ? `${u.disputesAgainst} lần bị khiếu nại` : `${u.disputesFiled} lần khiếu nại`}
                  </dd>
                  {u.role === UserRole.Tasker && (
                    <>
                      <dt>Điểm vi phạm · Đánh giá</dt>
                      <dd>
                        {u.violationPoints ?? 0} điểm · {u.ratingAverage != null ? `${u.ratingAverage.toFixed(1)}★` : '—'}
                      </dd>
                    </>
                  )}
                  {u.role === UserRole.Customer && (
                    <>
                      <dt>Khoản nợ</dt>
                      <dd className={u.outstandingAmount > 0 ? 'text-danger' : ''}>
                        {u.outstandingAmount > 0 ? formatVnd(u.outstandingAmount) : 'Không nợ'}
                        {u.unpaidReportCount > 0 && ` · ${u.unpaidReportCount} lần bị báo chưa thanh toán`}
                      </dd>
                    </>
                  )}
                </dl>
              </section>
              <section className="appeal-box appeal-box--lock">
                <h4>Lần khóa này</h4>
                <dl>
                  <dt>Lý do</dt>
                  <dd>{u.lockReason != null ? LOCK_REASON_LABELS[u.lockReason] : '—'}</dd>
                  <dt>Chi tiết</dt>
                  <dd>{u.lockDetail ?? '—'}</dd>
                  <dt>Khóa lúc</dt>
                  <dd>
                    {formatDateTime(u.lockedAt)}
                    {u.lockedByName ? ` · bởi ${u.lockedByName}` : ''}
                  </dd>
                  <dt>Yêu cầu</dt>
                  <dd>
                    Lần {detail.attemptNo}/{detail.maxAttempts}
                  </dd>
                </dl>
              </section>
            </div>

            <div className="moderation-quote">
              <div className="moderation-quote-head">
                Giải trình gửi lúc <b>{formatDateTime(detail.createdAt)}</b>
              </div>
              <p>{detail.content}</p>
            </div>
            <div>
              <div className="appeal-subtitle">Ảnh đính kèm</div>
              <PhotoGallery urls={detail.attachmentUrls} emptyText="Không đính kèm ảnh" />
            </div>

            {detail.previousAppeals.length > 0 && (
              <div>
                <div className="appeal-subtitle">Yêu cầu trước đó</div>
                <ul className="appeal-history">
                  {detail.previousAppeals.map((h) => (
                    <li key={h.id}>
                      <Badge variant={APPEAL_STATUS_LABELS[h.status].variant}>{APPEAL_STATUS_LABELS[h.status].label}</Badge>{' '}
                      {formatDateTime(h.createdAt)}
                      {h.adminNote ? ` – ${h.adminNote}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detail.status !== 0 && (
              <div className="moderation-quote">
                <div className="moderation-quote-head">
                  {APPEAL_STATUS_LABELS[detail.status].label} lúc {formatDateTime(detail.resolvedAt)}
                  {detail.resolvedByName ? ` · ${detail.resolvedByName}` : ''}
                </div>
                <p>{detail.adminNote ?? 'Không có ghi chú.'}</p>
              </div>
            )}

            {detail.status === 0 && decision && (
              <div className="form-field">
                <label htmlFor="appeal-note">
                  {decision === 'approve' ? 'Ghi chú gửi người dùng (không bắt buộc)' : 'Lý do từ chối'}{' '}
                  {decision === 'reject' && <span className="required-star">*</span>}
                </label>
                <textarea
                  id="appeal-note"
                  rows={3}
                  autoFocus
                  maxLength={NOTE_MAX}
                  className="form-input"
                  value={note}
                  placeholder={
                    decision === 'approve'
                      ? 'VD: Đã xác minh chuyển khoản trả nợ, mở khóa tài khoản.'
                      : 'VD: Ảnh chuyển khoản không khớp số tiền nợ của đơn #125.'
                  }
                  onChange={(e) => {
                    setNote(e.target.value);
                    setNoteError(null);
                  }}
                />
                <small className="field-hint">
                  {decision === 'approve'
                    ? 'Tài khoản được mở khóa ngay và người dùng nhận email thông báo.'
                    : `Người dùng nhận email kèm lý do; có thể gửi lại sau 7 ngày nếu còn lượt (tối thiểu ${NOTE_MIN} ký tự).`}
                </small>
              </div>
            )}
            {noteError && <div className="form-error-box">{noteError}</div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
