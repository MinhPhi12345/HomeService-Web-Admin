import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Gavel, Loader2 } from 'lucide-react';
import type { BookingResponse, DisputeResolution, DisputeResponse } from '../../types';
import { DisputeResolution as Resolution, DisputeStatus, PaymentMethod } from '../../types';
import { getDisputeById, resolveDispute } from '../../services/disputeService';
import { getBookingById } from '../../services/bookingService';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import ErrorState from '../common/ErrorState';
import PhotoGallery from '../common/PhotoGallery';
import { useToast } from '../common/useToast';
import {
  BOOKING_STATUS_LABELS,
  DISPUTE_REASON_LABELS,
  DISPUTE_RESOLUTION_LABELS,
  DISPUTE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from '../../utils/statusLabels';
import { formatDateTime, formatVnd } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorHandler';

interface Props {
  disputeId: number;
  onClose: () => void;
  onResolved: () => void;
}

interface Option {
  value: DisputeResolution;
  title: string;
  desc: string;
}

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function DisputeDetailModal({ disputeId, onClose, onResolved }: Props) {
  const toast = useToast();
  const [dispute, setDispute] = useState<DisputeResponse | null>(null);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  const [resolution, setResolution] = useState<DisputeResolution | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [redoTime, setRedoTime] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    getDisputeById(disputeId)
      .then(async (d) => {
        const b = await getBookingById(d.bookingId).catch(() => null);
        if (!ignore) {
          setDispute(d);
          setBooking(b);
          setError(null);
        }
      })
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [disputeId, reload]);

  const isCash = dispute?.paymentMethod === PaymentMethod.Cash;
  // US36: khiếu nại "khách chưa thanh toán" – đơn tiền mặt chưa có giao dịch thanh toán
  const isUnpaidClaim = Boolean(isCash && booking && booking.paymentStatus == null);

  const options: Option[] = useMemo(() => {
    if (!dispute) return [];
    if (isUnpaidClaim) {
      return [
        { value: Resolution.ReleaseFull, title: 'Bác khiếu nại', desc: 'Giữ nguyên khoản nợ của khách hàng.' },
        { value: Resolution.FullRefund, title: 'Hủy khoản nợ', desc: 'Xác minh khách đã trả tiền mặt – Tasker báo sai bị +2 điểm vi phạm.' },
      ];
    }
    const list: Option[] = [
      {
        value: Resolution.ReleaseFull,
        title: DISPUTE_RESOLUTION_LABELS[Resolution.ReleaseFull],
        desc: isCash ? 'Khiếu nại không hợp lệ, đơn được ghi nhận đã thanh toán.' : 'Giải ngân toàn bộ số tiền tạm giữ cho Tasker.',
      },
    ];
    if (!isCash) {
      list.push(
        { value: Resolution.PartialRefund, title: DISPUTE_RESOLUTION_LABELS[Resolution.PartialRefund], desc: 'Hoàn một phần cho khách, phần còn lại giải ngân cho Tasker.' },
        { value: Resolution.FullRefund, title: DISPUTE_RESOLUTION_LABELS[Resolution.FullRefund], desc: `Hoàn ${formatVnd(dispute.amount)} về phương thức khách đã thanh toán.` },
      );
    }
    list.push({ value: Resolution.Redo, title: DISPUTE_RESOLUTION_LABELS[Resolution.Redo], desc: 'Tasker quay lại làm lại miễn phí vào thời gian bạn chọn.' });
    return list;
  }, [dispute, isCash, isUnpaidClaim]);

  const minRedo = toLocalInput(new Date(Date.now() + 65 * 60_000));
  const maxRedo = toLocalInput(new Date(Date.now() + 30 * 86_400_000));

  const validate = (): string | null => {
    if (!dispute) return 'Không có dữ liệu khiếu nại.';
    if (resolution === null) return 'Vui lòng chọn kết quả xử lý.';
    if (resolution === Resolution.PartialRefund) {
      const v = Number(refundAmount);
      if (!refundAmount || !Number.isInteger(v) || v <= 0 || v >= dispute.amount)
        return `Số tiền hoàn phải là số nguyên lớn hơn 0 và nhỏ hơn ${formatVnd(dispute.amount)}.`;
    }
    if (resolution === Resolution.Redo) {
      if (!redoTime) return 'Vui lòng chọn thời gian làm lại.';
      const t = new Date(redoTime).getTime();
      if (t < Date.now() + 60 * 60_000 || t > Date.now() + 30 * 86_400_000)
        return 'Thời gian làm lại phải sau ít nhất 1 giờ và trong vòng 30 ngày.';
    }
    const len = note.trim().length;
    if (len < 10 || len > 1000) return 'Vui lòng ghi lý do quyết định (10–1000 ký tự).';
    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    setFormError(err);
    if (!err) setConfirming(true);
  };

  const doResolve = async () => {
    if (!dispute || resolution === null) return;
    setSubmitting(true);
    try {
      await resolveDispute(dispute.id, {
        resolution,
        refundAmount: resolution === Resolution.PartialRefund ? Number(refundAmount) : null,
        redoScheduledTime: resolution === Resolution.Redo ? new Date(redoTime).toISOString() : null,
        adminNote: note.trim(),
      });
      toast.success(`Đã xử lý khiếu nại KN-${dispute.id}.`);
      onResolved();
    } catch (err) {
      setConfirming(false);
      setFormError(getErrorMessage(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const chosen = options.find((o) => o.value === resolution);
  const isOpen = dispute?.status === DisputeStatus.Open;

  return (
    <>
      <Modal
        isOpen
        onClose={onClose}
        title={dispute ? `Khiếu nại KN-${dispute.id} · Đơn #${dispute.bookingId}` : 'Chi tiết khiếu nại'}
        maxWidth={920}
        footer={
          dispute && isOpen ? (
            <div className="confirm-dialog-actions">
              <Button variant="outline" onClick={onClose} disabled={submitting}>
                Đóng
              </Button>
              <Button icon={<Gavel size={16} />} onClick={handleSubmit} loading={submitting}>
                Xác nhận quyết định
              </Button>
            </div>
          ) : (
            <div className="confirm-dialog-actions">
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
            </div>
          )
        }
      >
        {loading ? (
          <div className="detail-loading">
            <Loader2 size={18} className="animate-spin" />
            <span>Đang tải hồ sơ khiếu nại…</span>
          </div>
        ) : error || !dispute ? (
          <ErrorState
            message={error ?? 'Không tìm thấy khiếu nại.'}
            onRetry={() => {
              setLoading(true);
              setReload((x) => x + 1);
            }}
          />
        ) : (
          <div className="dispute-detail">
            <div className="dispute-head">
              <Badge variant={DISPUTE_STATUS_LABELS[dispute.status].variant}>{DISPUTE_STATUS_LABELS[dispute.status].label}</Badge>
              <Badge variant="peach">{DISPUTE_REASON_LABELS[dispute.reason]}</Badge>
              {isUnpaidClaim && <Badge variant="lilac">Khiếu nại về thanh toán tiền mặt</Badge>}
            </div>

            <div className="info-grid">
              <div><span>Khách hàng</span><strong>{dispute.customerName}</strong></div>
              <div><span>Tasker</span><strong>{dispute.taskerName}</strong></div>
              <div><span>Số tiền</span><strong>{formatVnd(dispute.amount)} · {PAYMENT_METHOD_LABELS[dispute.paymentMethod]}</strong></div>
              <div><span>Dịch vụ</span><strong>{booking?.serviceCategoryName ?? '—'}</strong></div>
              <div><span>Lịch hẹn</span><strong>{booking ? formatDateTime(booking.scheduledTime) : '—'}</strong></div>
              <div>
                <span>Trạng thái đơn</span>
                <strong>{booking ? BOOKING_STATUS_LABELS[booking.status]?.label : '—'}</strong>
              </div>
              <div className="span-2"><span>Địa chỉ</span><strong>{booking?.address ?? '—'}</strong></div>
              <div><span>Ngày khiếu nại</span><strong>{formatDateTime(dispute.createdAt)}</strong></div>
              <div><span>Hạn Tasker phản hồi</span><strong>{formatDateTime(dispute.taskerResponseDueAt)}</strong></div>
            </div>

            <section className="detail-section">
              <h4>Nội dung khiếu nại của khách</h4>
              <p className="quote">{dispute.description}</p>
              <PhotoGallery urls={dispute.evidenceUrls} emptyText="Khách không gửi ảnh minh chứng" />
            </section>

            <section className="detail-section">
              <h4>Ảnh check-in / check-out của Tasker</h4>
              <PhotoGallery
                urls={[dispute.checkInPhotoUrl, dispute.checkOutPhotoUrl]}
                labels={['Check-in', 'Check-out']}
                emptyText="Không có ảnh check-in / check-out"
              />
            </section>

            <section className="detail-section">
              <h4>Phản hồi của Tasker</h4>
              {dispute.taskerResponse ? (
                <>
                  <p className="quote">{dispute.taskerResponse}</p>
                  <PhotoGallery urls={dispute.taskerEvidenceUrls} emptyText="Tasker không gửi ảnh" />
                </>
              ) : (
                <p className="muted-line">
                  <Clock size={14} /> Tasker chưa phản hồi
                  {new Date(dispute.taskerResponseDueAt) < new Date() ? ' (đã quá hạn – có thể xử lý ngay)' : ` (hạn ${formatDateTime(dispute.taskerResponseDueAt)})`}
                </p>
              )}
            </section>

            {!isOpen && (
              <section className="detail-section resolved-box">
                <h4>
                  <CheckCircle2 size={16} /> Kết quả xử lý
                </h4>
                <div className="info-grid">
                  <div className="span-2">
                    <span>Quyết định</span>
                    <strong>{dispute.resolution != null ? DISPUTE_RESOLUTION_LABELS[dispute.resolution] : '—'}</strong>
                  </div>
                  {dispute.refundAmount != null && (
                    <div><span>Số tiền hoàn</span><strong>{formatVnd(dispute.refundAmount)}</strong></div>
                  )}
                  {dispute.redoScheduledTime && (
                    <div><span>Lịch làm lại</span><strong>{formatDateTime(dispute.redoScheduledTime)}</strong></div>
                  )}
                  <div><span>Thời gian xử lý</span><strong>{formatDateTime(dispute.resolvedAt)}</strong></div>
                </div>
                {dispute.adminNote && <p className="quote">{dispute.adminNote}</p>}
              </section>
            )}

            {isOpen && (
              <section className="detail-section resolve-form">
                <h4>
                  <Gavel size={16} /> Quyết định của Admin
                </h4>
                <div className="resolve-options">
                  {options.map((o) => (
                    <label key={o.value} className={`resolve-option ${resolution === o.value ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="resolution"
                        checked={resolution === o.value}
                        onChange={() => {
                          setResolution(o.value);
                          setFormError(null);
                        }}
                      />
                      <span>
                        <strong>{o.title}</strong>
                        <small>{o.desc}</small>
                      </span>
                    </label>
                  ))}
                </div>

                {resolution === Resolution.PartialRefund && (
                  <div className="form-field">
                    <label htmlFor="refund">Số tiền hoàn cho khách (đ)</label>
                    <input
                      id="refund"
                      type="number"
                      min={1000}
                      step={1000}
                      max={dispute.amount - 1}
                      value={refundAmount}
                      placeholder={`Nhỏ hơn ${formatVnd(dispute.amount)}`}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="form-input"
                    />
                    <div className="chip-row">
                      {[25, 50, 75].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          className="preset-pill-btn"
                          onClick={() => setRefundAmount(String(Math.round((dispute.amount * pct) / 100 / 1000) * 1000))}
                        >
                          {pct}% · {formatVnd(Math.round((dispute.amount * pct) / 100 / 1000) * 1000)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {resolution === Resolution.Redo && (
                  <div className="form-field">
                    <label htmlFor="redo">Thời gian Tasker làm lại</label>
                    <input
                      id="redo"
                      type="datetime-local"
                      min={minRedo}
                      max={maxRedo}
                      value={redoTime}
                      onChange={(e) => setRedoTime(e.target.value)}
                      className="form-input"
                    />
                    <small className="field-hint">Sau ít nhất 1 giờ và trong vòng 30 ngày tới.</small>
                  </div>
                )}

                <div className="form-field">
                  <label htmlFor="note">Lý do quyết định (gửi cho khách hàng và Tasker)</label>
                  <textarea
                    id="note"
                    rows={3}
                    maxLength={1000}
                    value={note}
                    placeholder="VD: Ảnh check-out cho thấy phòng tắm chưa được vệ sinh, chấp nhận hoàn 50%…"
                    onChange={(e) => setNote(e.target.value)}
                    className="form-input"
                  />
                  <small className="field-hint">{note.trim().length}/1000 ký tự (tối thiểu 10)</small>
                </div>

                {formError && <div className="form-error-box">{formError}</div>}
              </section>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirming}
        title="Xác nhận quyết định khiếu nại"
        message={
          chosen && dispute
            ? `Bạn chắc chắn chọn "${chosen.title}"${resolution === Resolution.PartialRefund ? ` (hoàn ${formatVnd(Number(refundAmount))})` : ''} cho khiếu nại KN-${dispute.id}? Quyết định không thể hoàn tác.`
            : ''
        }
        confirmText="Xác nhận"
        confirmVariant={resolution === Resolution.ReleaseFull ? 'primary' : 'danger'}
        isLoading={submitting}
        onConfirm={doResolve}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
