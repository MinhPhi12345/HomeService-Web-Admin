import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, Loader2, Search, Star, Trash2 } from 'lucide-react';
import type { ReviewResponse } from '../types';
import { deleteReview, getFlaggedReviews, keepReview } from '../services/reviewService';
import { useAdminCounters } from '../context/useAdminCounters';
import { useToast } from '../components/common/useToast';
import { useDebounce } from '../hooks/useDebounce';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Pagination from '../components/common/Pagination';
import TableSkeleton from '../components/common/TableSkeleton';
import { formatDateTime } from '../utils/formatters';
import { getErrorMessage } from '../utils/errorHandler';
import { exportToExcel } from '../utils/excelExport';

type Action = { kind: 'keep' | 'delete'; review: ReviewResponse };

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
          String(r.bookingId) === kw,
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [items, debounced, ratingFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const doAction = async () => {
    if (!action) return;
    setWorking(true);
    try {
      if (action.kind === 'keep') {
        await keepReview(action.review.id);
        toast.success('Đã giữ lại đánh giá và gỡ cờ báo cáo.');
      } else {
        await deleteReview(action.review.id);
        toast.success('Đã xóa đánh giá vi phạm. Điểm đánh giá được tính lại.');
      }
      setItems((prev) => prev.filter((r) => r.id !== action.review.id));
      refreshCounters();
      setAction(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
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
                  <th>Số sao</th>
                  <th style={{ minWidth: 240 }}>Nội dung</th>
                  <th>Ngày</th>
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
                    </td>
                    <td>
                      <p className="review-comment">{r.comment?.trim() ? `“${r.comment}”` : <em className="text-muted">Không có nội dung</em>}</p>
                    </td>
                    <td>{formatDateTime(r.createdAt)}</td>
                    <td>
                      <div className="action-row">
                        <button type="button" className="btn-action-pill btn-unlock" onClick={() => setAction({ kind: 'keep', review: r })}>
                          <CheckCircle2 size={14} /> Giữ lại
                        </button>
                        <button type="button" className="btn-action-pill btn-lock" onClick={() => setAction({ kind: 'delete', review: r })}>
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
          ⓘ “Giữ lại” gỡ cờ báo cáo và đánh giá tiếp tục hiển thị. “Xóa” gỡ bỏ vĩnh viễn đánh giá vi phạm (ngôn từ xúc phạm, thông tin
          cá nhân, spam) và tính lại điểm đánh giá trung bình.
        </span>
      </div>

      <ConfirmDialog
        isOpen={Boolean(action)}
        title={action?.kind === 'delete' ? 'Xóa đánh giá vi phạm?' : 'Giữ lại đánh giá?'}
        message={
          action?.kind === 'delete'
            ? `Đánh giá ${action.review.rating}★ của "${action.review.reviewerName}" cho "${action.review.revieweeName}" sẽ bị xóa vĩnh viễn. Thao tác không thể hoàn tác.`
            : `Đánh giá của "${action?.review.reviewerName}" sẽ được gỡ cờ báo cáo và tiếp tục hiển thị công khai.`
        }
        confirmText={action?.kind === 'delete' ? 'Xóa đánh giá' : 'Giữ lại'}
        confirmVariant={action?.kind === 'delete' ? 'danger' : 'primary'}
        isLoading={working}
        onConfirm={doAction}
        onCancel={() => setAction(null)}
      />
    </div>
  );
}
