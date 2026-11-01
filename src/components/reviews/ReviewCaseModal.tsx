import { useEffect, useState } from 'react';
import { CheckCircle2, Flag, Gavel, Loader2, ShieldCheck, Star, Trash2 } from 'lucide-react';
import type { BookingResponse, DisputeResponse, ReviewResponse } from '../../types';
import { UserRole } from '../../types';
import { getBookingById } from '../../services/bookingService';
import { getDisputeById } from '../../services/disputeService';
import { getBookingReviews, getPublicProfile, type PublicProfile } from '../../services/reviewService';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ErrorState from '../common/ErrorState';
import PhotoGallery from '../common/PhotoGallery';
import { BOOKING_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '../../utils/bookingStatusLabels';
import { DISPUTE_REASON_LABELS, DISPUTE_RESOLUTION_LABELS, DISPUTE_STATUS_LABELS } from '../../utils/statusLabels';
import { formatDate, formatDateTime, formatVnd } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorHandler';

interface Props {
  review: ReviewResponse;
  onClose: () => void;
  /** Bấm "Giữ lại" / "Xóa" trong hồ sơ → mở hộp nhập lý do quyết định */
  onModerate: (kind: 'keep' | 'delete', review: ReviewResponse) => void;
}

interface CaseData {
  booking: BookingResponse | null;
  reviews: ReviewResponse[];
  dispute: DisputeResponse | null;
  reviewer: PublicProfile | null;
  reviewee: PublicProfile | null;
}

function Stars({ value }: { value: number }) {
  return (
    <span className="stars" aria-label={`${value} sao`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} fill={i <= value ? '#FFB938' : 'none'} color={i <= value ? '#FFB938' : '#D9E3E6'} />
      ))}
    </span>
  );
}

function ProfileCard({ title, profile, fallbackName }: { title: string; profile: PublicProfile | null; fallbackName: string }) {
  return (
    <div className="case-profile">
      <span className="case-profile-title">{title}</span>
      <strong>{profile?.displayName ?? fallbackName}</strong>
      {profile ? (
        <>
          <span className="case-profile-role">
            {profile.role === UserRole.Tasker ? 'Tasker' : 'Khách hàng'}
            {profile.isVerified ? ' · Đã xác thực CCCD' : ''} · Tham gia {formatDate(profile.memberSince)}
          </span>
          <div className="case-profile-stats">
            <span>
              <Star size={13} fill="#FFB938" color="#FFB938" />{' '}
              {profile.ratingAverage != null ? profile.ratingAverage.toFixed(1) : '—'}
            </span>
            <span>{profile.reviewCount} đánh giá nhận được</span>
            <span>{profile.completedBookings} đơn hoàn tất</span>
          </div>
        </>
      ) : (
        <span className="case-profile-role">Không tải được hồ sơ uy tín</span>
      )}
    </div>
  );
}

/**
 * US27 – Hồ sơ phân xử đánh giá bị báo cáo: chi tiết đơn, ảnh check-in/check-out, toàn bộ đánh giá 2 chiều trong đơn,
 * khiếu nại liên quan (nếu có) và uy tín của 2 bên – để Admin đối chiếu trước khi giữ lại hay gỡ đánh giá.
 */
export default function ReviewCaseModal({ review, onClose, onModerate }: Props) {
  const [data, setData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const [booking, reviews, reviewer, reviewee] = await Promise.all([
          getBookingById(review.bookingId),
          getBookingReviews(review.bookingId).catch(() => [] as ReviewResponse[]),
          getPublicProfile(review.reviewerId).catch(() => null),
          getPublicProfile(review.revieweeId).catch(() => null),
        ]);
        const dispute = booking?.disputeId ? await getDisputeById(booking.disputeId).catch(() => null) : null;
        if (!ignore) {
          setData({ booking, reviews, dispute, reviewer, reviewee });
          setError(null);
        }
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [review, reload]);

  const b = data?.booking ?? null;
  // Đánh giá chiều ngược lại (bên kia viết về người viết đánh giá đang xét) – thường liên quan khi hai bên "đánh giá trả đũa"
  const others = data ? data.reviews.filter((r) => r.id !== review.id) : [];

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Hồ sơ phân xử · Đơn #${review.bookingId}`}
      maxWidth={920}
      footer={
        <div className="confirm-dialog-actions">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button variant="outline" icon={<CheckCircle2 size={16} />} onClick={() => onModerate('keep', review)}>
            Giữ lại đánh giá
          </Button>
          <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => onModerate('delete', review)}>
            Xóa đánh giá
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="detail-loading">
          <Loader2 size={18} className="animate-spin" />
          <span>Đang tải chi tiết đơn…</span>
        </div>
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => {
            setLoading(true);
            setReload((x) => x + 1);
          }}
        />
      ) : (
        <div className="dispute-detail">
          <section className="detail-section">
            <h4>
              <Flag size={16} /> Đánh giá đang bị báo cáo
            </h4>
            <div className="case-review case-review--flagged">
              <div className="case-review-head">
                <b>{review.reviewerName}</b> → {review.revieweeName}
                <Stars value={review.rating} />
                <span className="case-review-time">{formatDateTime(review.createdAt)}</span>
              </div>
              <p>{review.comment?.trim() ? `“${review.comment}”` : 'Không có nội dung'}</p>
            </div>
            <div className="moderation-quote moderation-quote--report">
              <div className="moderation-quote-head">
                <Flag size={13} /> Báo cáo của <b>{review.reportedByName ?? 'người dùng'}</b>
                {review.reportedAt && <span> · {formatDateTime(review.reportedAt)}</span>}
              </div>
              <p>{review.reportReason ?? 'Không ghi lý do (báo cáo từ phiên bản cũ).'}</p>
            </div>
          </section>

          {b ? (
            <>
              <div className="dispute-head">
                <Badge variant={BOOKING_STATUS_LABELS[b.status]?.variant ?? 'neutral'}>
                  {BOOKING_STATUS_LABELS[b.status]?.label ?? 'Không rõ'}
                </Badge>
                <Badge variant="sky">{PAYMENT_METHOD_LABELS[b.paymentMethod]}</Badge>
                {b.paymentStatus != null && PAYMENT_STATUS_LABELS[b.paymentStatus] && (
                  <Badge variant={PAYMENT_STATUS_LABELS[b.paymentStatus].variant}>
                    {PAYMENT_STATUS_LABELS[b.paymentStatus].label}
                  </Badge>
                )}
                {b.isTaskerNoShow && <Badge variant="danger">Tasker không đến</Badge>}
              </div>

              <div className="info-grid">
                <div><span>Dịch vụ</span><strong>{b.serviceCategoryName} × {b.quantity}</strong></div>
                <div><span>Tổng tiền</span><strong>{formatVnd(b.totalPrice)}</strong></div>
                <div><span>Lịch hẹn</span><strong>{formatDateTime(b.scheduledTime)}</strong></div>
                <div><span>Khách hàng</span><strong>{b.customerName}</strong></div>
                <div><span>Tasker</span><strong>{b.taskerName ?? '—'}</strong></div>
                <div><span>Hoàn thành lúc</span><strong>{b.completedAt ? formatDateTime(b.completedAt) : '—'}</strong></div>
                <div className="span-2"><span>Địa chỉ</span><strong>{b.address}</strong></div>
                <div><span>Ngày đặt</span><strong>{formatDateTime(b.createdAt)}</strong></div>
                {b.note && (
                  <div className="span-2"><span>Ghi chú của khách khi đặt</span><strong>{b.note}</strong></div>
                )}
                {b.cancellationFee > 0 && (
                  <div><span>Phí hủy</span><strong>{formatVnd(b.cancellationFee)}</strong></div>
                )}
              </div>

              <section className="detail-section">
                <h4>Ảnh trước / sau khi làm của Tasker</h4>
                <PhotoGallery
                  urls={[b.checkInPhotoUrl, b.checkOutPhotoUrl]}
                  labels={['Trước khi làm (check-in)', 'Sau khi làm (check-out)']}
                  emptyText="Đơn này không có ảnh check-in / check-out"
                />
              </section>
            </>
          ) : (
            <p className="muted-line">Không tải được chi tiết đơn #{review.bookingId}.</p>
          )}

          <section className="detail-section">
            <h4>Đánh giá của bên còn lại trong đơn</h4>
            <div className="case-reviews">
              {others.map((r) => (
                <div key={r.id} className="case-review">
                  <div className="case-review-head">
                    <b>{r.reviewerName}</b> → {r.revieweeName}
                    <Stars value={r.rating} />
                    {r.isFlagged ? (
                      <Badge variant="peach">Cũng đang bị báo cáo</Badge>
                    ) : r.moderatedAt ? (
                      <Badge variant="mint">Đã kiểm duyệt – giữ lại</Badge>
                    ) : null}
                    <span className="case-review-time">{formatDateTime(r.createdAt)}</span>
                  </div>
                  <p>{r.comment?.trim() ? `“${r.comment}”` : 'Không có nội dung'}</p>
                  {r.isFlagged && r.reportReason && (
                    <small className="case-review-note">
                      <Flag size={12} /> {r.reportedByName ?? 'Người dùng'} báo cáo: {r.reportReason}
                    </small>
                  )}
                </div>
              ))}
              {others.length === 0 && <p className="muted-line">Bên còn lại chưa đánh giá đơn này.</p>}
            </div>
          </section>

          {data?.dispute && (
            <section className="detail-section">
              <h4>
                <Gavel size={16} /> Khiếu nại liên quan · KN-{data.dispute.id}
              </h4>
              <div className="dispute-head">
                <Badge variant={DISPUTE_STATUS_LABELS[data.dispute.status].variant}>
                  {DISPUTE_STATUS_LABELS[data.dispute.status].label}
                </Badge>
                <Badge variant="peach">{DISPUTE_REASON_LABELS[data.dispute.reason]}</Badge>
                {data.dispute.resolution != null && (
                  <Badge variant="mint">{DISPUTE_RESOLUTION_LABELS[data.dispute.resolution]}</Badge>
                )}
              </div>
              <p className="quote">
                <b>Khách:</b> {data.dispute.description}
              </p>
              {data.dispute.taskerResponse && (
                <p className="quote">
                  <b>Tasker:</b> {data.dispute.taskerResponse}
                </p>
              )}
              {data.dispute.adminNote && (
                <p className="quote">
                  <b>Kết luận của Admin:</b> {data.dispute.adminNote}
                </p>
              )}
              <PhotoGallery
                urls={[...data.dispute.evidenceUrls, ...data.dispute.taskerEvidenceUrls]}
                emptyText="Không có ảnh minh chứng khiếu nại"
              />
            </section>
          )}

          <section className="detail-section">
            <h4>
              <ShieldCheck size={16} /> Uy tín của hai bên
            </h4>
            <div className="case-profiles">
              <ProfileCard title="Người viết đánh giá" profile={data?.reviewer ?? null} fallbackName={review.reviewerName} />
              <ProfileCard title="Người được đánh giá" profile={data?.reviewee ?? null} fallbackName={review.revieweeName} />
            </div>
          </section>
        </div>
      )}
    </Modal>
  );
}
