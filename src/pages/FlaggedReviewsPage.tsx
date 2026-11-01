import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, Flag, Loader2, Search, Star, Trash2 } from 'lucide-react';
import type { ReviewResponse } from '../types';
import { getFlaggedReviews, moderateReview } from '../services/reviewService';
import { useAdminCounters } from '../context/useAdminCounters';
import { useToast } from '../components/common/useToast';
import { useDebounce } from '../hooks/useDebounce';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Pagination from '../components/common/Pagination';
import TableSkeleton from '../components/common/TableSkeleton';
import { formatDateTime } from '../utils/formatters';
import { getErrorMessage } from '../utils/errorHandler';
import { exportToExcel } from '../utils/excelExport';

type Action = { kind: 'keep' | 'delete'; review: ReviewResponse };

const NOTE_MIN = 10;
const NOTE_MAX = 500;

const RATING_FILTERS = [
  { value: 0, label: 'Tất cả' },
  { value: 2, label: '1–2 sao' },
  { value: 3, label: '3 sao' },
  { value: 5, label: '4–5 sao' },
];

function normalize(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
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

export default function FlaggedReviewsPage() {
  const toast = useToast();
  const { refresh: refreshCounters } = useAdminCounters();
  const [items, setItems] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [keyword, setKeyword] = useState('');
  const debounced = useDebounce(keyword, 250);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [action, setAction] = useState<Action | null>(null);
  const [working, setWorking] = useState(false);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let ignore = false;
    getFlaggedReviews()
      .then((data) => {
        if (!ignore) {
          setItems(data);
          setError(null);
        }
      })
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [reload]);

  const filtered = useMemo(() => {
    const kw = normalize(debounced.trim().replace(/^#/, ''));
    return items
      .filter((r) => {
        if (ratingFilter === 2) return r.rating <= 2;
        if (ratingFilter === 3) return r.rating === 3;
        if (ratingFilter === 5) return r.rating >= 4;
        return true;
      })
      .filter(
        (r) =>
          !kw ||
          normalize(r.reviewerName).includes(kw) ||
          normalize(r.revieweeName).includes(kw) ||
          normalize(r.comment ?? '').includes(kw) ||
          normalize(r.reportReason ?? '').includes(kw) ||
          normalize(r.reportedByName ?? '').includes(kw) ||
          String(r.bookingId) === kw,
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [items, debounced, ratingFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const openAction = (kind: Action['kind'], review: ReviewResponse) => {
    setNote('');
    setNoteError(null);
    setAction({ kind, review });
  };

  const doAction = async () => {
    if (!action) return;
    const text = note.trim();
    if (text.length < NOTE_MIN) {
      setNoteError(`Vui lòng nhập lý do quyết định (ít nhất ${NOTE_MIN} ký tự).`);
      return;
    }
    setWorking(true);
    try {
      await moderateReview(action.review.id, action.kind === 'delete', text);
      toast.success(
        action.kind === 'delete'
          ? 'Đã gỡ đánh giá vi phạm và gửi lý do cho các bên. Điểm đánh giá được tính lại.'
          : 'Đã giữ lại đánh giá và gửi lý do cho người báo cáo.',
      );
      setItems((prev) => prev.filter((r) => r.id !== action.review.id));
      refreshCounters();
      setAction(null);
    } catch (err) {
      setNoteError(getErrorMessage(err));
    } finally {
      setWorking(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportToExcel<ReviewResponse>({
        fileNamePrefix: 'danh-gia-bi-bao-cao',
        sheetName: 'Đánh giá bị báo cáo',
        columns: [
          { header: 'Mã đơn', key: 'bookingId', width: 10, getValue: (r) => `#${r.bookingId}` },
          { header: 'Người đánh giá', key: 'reviewerName', width: 24 },
          { header: 'Người được đánh giá', key: 'revieweeName', width: 24 },
          { header: 'Số sao', key: 'rating', width: 10, format: 'number' },
          { header: 'Nội dung', key: 'comment', width: 50 },
          { header: 'Ngày đánh giá', key: 'createdAt', width: 18, getValue: (r) => formatDateTime(r.createdAt) },
          { header: 'Người báo cáo', key: 'reportedByName', width: 24, getValue: (r) => r.reportedByName ?? '' },
          { header: 'Lý do báo cáo', key: 'reportReason', width: 50, getValue: (r) => r.reportReason ?? '' },
          { header: 'Thời gian báo cáo', key: 'reportedAt', width: 18, getValue: (r) => (r.reportedAt ? formatDateTime(r.reportedAt) : '') },
        ],
        data: filtered,
      });
      toast.success(`Đã xuất ${filtered.length} đánh giá ra Excel.`);
    } catch {
      toast.error('Lỗi khi xuất file Excel. Vui lòng thử lại.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="list-toolbar">
        <div className="role-tab-group">
          {RATING_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`role-tab-btn ${ratingFilter === f.value ? 'active' : ''}`}
              onClick={() => {
                setRatingFilter(f.value);
                setPage(1);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="toolbar-actions">
          <div className="search-input-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên, nội dung hoặc mã đơn…"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <button type="button" className="btn-excel" onClick={handleExport} disabled={exporting || filtered.length === 0}>
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>{exporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
          </button>
        </div>
      </div>

      {error && !loading ? (
        <ErrorState
          message={error}
          onRetry={() => {
            setLoading(true);
            setReload((x) => x + 1);
          }}
        />
      ) : loading ? (
        <div className="card">
          <TableSkeleton rows={4} columns={6} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title={items.length === 0 ? 'Không có đánh giá nào bị báo cáo' : 'Không tìm thấy đánh giá phù hợp'}
            description={items.length === 0 ? 'Khi người dùng báo cáo một đánh giá không phù hợp, nó sẽ xuất hiện ở đây để bạn kiểm duyệt.' : undefined}
          />
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 56, textAlign: 'center' }}>STT</th>
                  <th>Đơn</th>
                  <th>Người đánh giá → Người được đánh giá</th>
                  <th style={{ minWidth: 220 }}>Đánh giá</th>
                  <th style={{ minWidth: 260 }}>Lý do báo cáo</th>
                  <th style={{ textAlign: 'center' }}>Kiểm duyệt</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.id}>
                    <td style={{ textAlign: 'center', color: 'var(--ink-400)' }}>{(safePage - 1) * pageSize + idx + 1}</td>
                    <td className="font-medium">#{r.bookingId}</td>
                    <td>
                      <div className="font-medium">{r.reviewerName}</div>
                      <div className="cell-sub">→ {r.revieweeName}</div>
                    </td>
                    <td>
                      <Stars value={r.rating} />
                      <p className="review-comment">{r.comment?.trim() ? `“${r.comment}”` : <em className="text-muted">Không có nội dung</em>}</p>
                      <div className="cell-sub">{formatDateTime(r.createdAt)}</div>
                    </td>
                    <td>
                      {r.reportReason ? (
                        <div className="report-reason">
                          <div className="report-reason-by">
                            <Flag size={13} /> {r.reportedByName ?? 'Người dùng'}
                            {r.reportedAt && <span> · {formatDateTime(r.reportedAt)}</span>}
                          </div>
                          <p>{r.reportReason}</p>
                        </div>
                      ) : (
                        <em className="text-muted">Không ghi lý do (báo cáo từ phiên bản cũ)</em>
                      )}
                    </td>
                    <td>
                      <div className="action-row">
                        <button type="button" className="btn-action-pill btn-unlock" onClick={() => openAction('keep', r)}>
                          <CheckCircle2 size={14} /> Giữ lại
                        </button>
                        <button type="button" className="btn-action-pill btn-lock" onClick={() => openAction('delete', r)}>
                          <Trash2 size={14} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            totalRecords={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        </div>
      )}

      <div className="admin-notice-box">
        <span>
          ⓘ Đối chiếu lý do báo cáo với nội dung đánh giá và chi tiết đơn trước khi quyết định. “Giữ lại” gỡ cờ, đánh giá tiếp tục
          hiển thị và không bị báo cáo lại. “Xóa” gỡ đánh giá vi phạm (sai sự thật, ngôn từ xúc phạm, thông tin cá nhân, spam), tính lại
          điểm trung bình và người viết không thể đánh giá lại đơn đó (mỗi đơn chỉ đánh giá 1 lần). Lý do của bạn được gửi cho các bên và ghi vào Nhật ký kiểm toán.
        </span>
      </div>

      <Modal
        isOpen={Boolean(action)}
        onClose={() => !working && setAction(null)}
        title={action?.kind === 'delete' ? 'Gỡ đánh giá vi phạm' : 'Giữ lại đánh giá'}
        maxWidth={560}
        footer={
          <div className="confirm-dialog-actions">
            <Button type="button" variant="outline" onClick={() => setAction(null)} disabled={working}>
              Hủy
            </Button>
            <Button type="button" variant={action?.kind === 'delete' ? 'danger' : 'primary'} onClick={doAction} loading={working}>
              {action?.kind === 'delete' ? 'Gỡ đánh giá' : 'Giữ lại'}
            </Button>
          </div>
        }
      >
        {action && (
          <div className="moderation-dialog">
            <div className="moderation-quote">
              <div className="moderation-quote-head">
                <b>{action.review.reviewerName}</b> → {action.review.revieweeName} · Đơn #{action.review.bookingId}
              </div>
              <Stars value={action.review.rating} />
              <p>{action.review.comment?.trim() ? `“${action.review.comment}”` : 'Không có nội dung'}</p>
            </div>
            <div className="moderation-quote moderation-quote--report">
              <div className="moderation-quote-head">
                <Flag size={13} /> Báo cáo của <b>{action.review.reportedByName ?? 'người dùng'}</b>
              </div>
              <p>{action.review.reportReason ?? 'Không ghi lý do (báo cáo từ phiên bản cũ).'}</p>
            </div>
            <div className="form-field">
              <label htmlFor="moderation-note">
                Lý do quyết định <span className="required-star">*</span>
              </label>
              <textarea
                id="moderation-note"
                rows={3}
                maxLength={NOTE_MAX}
                value={note}
                autoFocus
                placeholder={
                  action.kind === 'delete'
                    ? 'VD: Ảnh check-out cho thấy công việc đã hoàn thành đủ hạng mục, nhận xét sai sự thật.'
                    : 'VD: Đối chiếu ảnh trước/sau, nhận xét phản ánh đúng việc Tasker đến trễ 30 phút.'
                }
                onChange={(e) => {
                  setNote(e.target.value);
                  setNoteError(null);
                }}
                className="form-input"
              />
              <small className="field-hint">
                {note.trim().length}/{NOTE_MAX} ký tự (tối thiểu {NOTE_MIN}).{' '}
                {action.kind === 'delete'
                  ? 'Gửi cho người viết đánh giá và người báo cáo. Người viết không thể đánh giá lại đơn này.'
                  : 'Gửi cho người báo cáo; đánh giá sẽ không bị báo cáo lại.'}
              </small>
            </div>
            {noteError && <div className="form-error-box">{noteError}</div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
