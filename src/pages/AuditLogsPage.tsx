import { useEffect, useState } from 'react';
import { Download, Hash, Loader2, RotateCcw } from 'lucide-react';
import type { AuditLogItem } from '../types';
import { getAuditLogs, type AuditLogQuery } from '../services/auditLogService';
import { fetchAllPages } from '../services/reportService';
import { useToast } from '../components/common/useToast';
import { useDebounce } from '../hooks/useDebounce';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Pagination from '../components/common/Pagination';
import TableSkeleton from '../components/common/TableSkeleton';
import { AUDIT_ACTION_LABELS, auditActionMeta, prettyAuditDetail } from '../utils/auditLabels';
import { formatDateTime, formatVnd } from '../utils/formatters';
import { getErrorMessage } from '../utils/errorHandler';
import { exportToExcel } from '../utils/excelExport';
import { toRangeParams } from '../utils/dateRange';

export default function AuditLogsPage() {
  const toast = useToast();
  const [action, setAction] = useState('');
  const [bookingInput, setBookingInput] = useState('');
  const bookingId = useDebounce(bookingInput.replace(/\D/g, ''), 350);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [exporting, setExporting] = useState(false);

  const buildQuery = (): AuditLogQuery => {
    const q: AuditLogQuery = {};
    if (action) q.action = action;
    if (bookingId) q.bookingId = Number(bookingId);
    if (from || to) {
      const r = toRangeParams(from || '2000-01-01', to || '2100-12-31');
      if (from) q.from = r.from;
      if (to) q.to = r.to;
    }
    return q;
  };

  useEffect(() => {
    let ignore = false;
    getAuditLogs({ ...buildQuery(), page, pageSize })
      .then((res) => {
        if (ignore) return;
        setItems(res.items);
        setTotal(res.totalCount);
        setError(null);
      })
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, bookingId, from, to, page, pageSize, reload]);

  const update = (fn: () => void) => {
    setLoading(true);
    setPage(1);
    fn();
  };

  const hasFilter = Boolean(action || bookingInput || from || to);

  const handleExport = async () => {
    try {
      setExporting(true);
      const q = buildQuery();
      const all = await fetchAllPages((p, size) => getAuditLogs({ ...q, page: p, pageSize: size }));
      await exportToExcel<AuditLogItem>({
        fileNamePrefix: 'nhat-ky-kiem-toan',
        sheetName: 'Nhật ký kiểm toán',
        columns: [
          { header: 'Mã', key: 'id', width: 8 },
          { header: 'Thời gian', key: 'createdAt', width: 18, getValue: (r) => formatDateTime(r.createdAt) },
          { header: 'Hành động', key: 'action', width: 26, getValue: (r) => auditActionMeta(r.action).label },
          { header: 'Mã đơn', key: 'bookingId', width: 10, getValue: (r) => (r.bookingId ? `#${r.bookingId}` : '') },
          { header: 'Mã thanh toán', key: 'paymentId', width: 14 },
          { header: 'Người thực hiện', key: 'actorName', width: 24 },
          { header: 'Số tiền', key: 'amount', width: 16, format: 'currency' },
          { header: 'Chi tiết', key: 'detail', width: 60, getValue: (r) => prettyAuditDetail(r.detail) },
        ],
        data: all,
      });
      toast.success(`Đã xuất ${all.length} dòng nhật ký ra Excel.`);
    } catch {
      toast.error('Lỗi khi xuất file Excel. Vui lòng thử lại.');
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="admin-page">
      <div className="list-toolbar audit-toolbar">
        <div className="filter-dates-group">
          <select
            className="filter-select"
            value={action}
            onChange={(e) => update(() => setAction(e.target.value))}
            aria-label="Lọc theo hành động"
          >
            <option value="">Tất cả hành động</option>
            {Object.entries(AUDIT_ACTION_LABELS).map(([key, v]) => (
              <option key={key} value={key}>
                {v.label}
              </option>
            ))}
          </select>
          <div className="search-input-box small">
            <Hash size={15} className="search-icon" />
            <input
              type="text"
              inputMode="numeric"
              placeholder="Mã đơn"
              value={bookingInput}
              onChange={(e) => update(() => setBookingInput(e.target.value))}
              aria-label="Lọc theo mã đơn"
            />
          </div>
          <div className="date-input-item">
            <label className="date-label" htmlFor="audit-from">Từ</label>
            <input id="audit-from" type="date" className="input-date" value={from} max={to || undefined} onChange={(e) => update(() => setFrom(e.target.value))} />
          </div>
          <div className="date-input-item">
            <label className="date-label" htmlFor="audit-to">Đến</label>
            <input id="audit-to" type="date" className="input-date" value={to} min={from || undefined} onChange={(e) => update(() => setTo(e.target.value))} />
          </div>
          {hasFilter && (
            <button
              type="button"
              className="btn-quick-filter"
              onClick={() =>
                update(() => {
                  setAction('');
                  setBookingInput('');
                  setFrom('');
                  setTo('');
                })
              }
            >
              <RotateCcw size={13} /> Xóa lọc
            </button>
          )}
        </div>
        <div className="toolbar-actions">
          <button type="button" className="btn-excel" onClick={handleExport} disabled={exporting || total === 0}>
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
      ) : loading && items.length === 0 ? (
        <div className="card">
          <TableSkeleton rows={6} columns={7} />
        </div>
      ) : total === 0 ? (
        <div className="card">
          <EmptyState title={hasFilter ? 'Không có nhật ký phù hợp bộ lọc' : 'Chưa có nhật ký nào'} />
        </div>
      ) : (
        <div className={`card ${loading ? 'is-refreshing' : ''}`}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 56, textAlign: 'center' }}>STT</th>
                  <th>Thời gian</th>
                  <th>Hành động</th>
                  <th>Đơn</th>
                  <th>Người thực hiện</th>
                  <th style={{ textAlign: 'right' }}>Số tiền</th>
                  <th style={{ minWidth: 260 }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r, idx) => {
                  const meta = auditActionMeta(r.action);
                  return (
                    <tr key={r.id}>
                      <td style={{ textAlign: 'center', color: 'var(--ink-400)' }}>{(page - 1) * pageSize + idx + 1}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.createdAt)}</td>
                      <td>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </td>
                      <td>
                        {r.bookingId ? (
                          <button
                            type="button"
                            className="link-btn"
                            title="Lọc nhật ký của đơn này"
                            onClick={() => update(() => setBookingInput(String(r.bookingId)))}
                          >
                            #{r.bookingId}
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <span className={r.actorUserId == null ? 'text-muted' : 'font-medium'} style={{ whiteSpace: 'nowrap' }}>{r.actorName}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{r.amount ? formatVnd(r.amount) : '—'}</td>
                      <td>
                        <span className="cell-wrap">{prettyAuditDetail(r.detail)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalRecords={total}
            pageSize={pageSize}
            pageSizeOptions={[20, 50, 100]}
            onPageChange={(p) => {
              setLoading(true);
              setPage(p);
            }}
            onPageSizeChange={(s) => update(() => setPageSize(s))}
          />
        </div>
      )}

      <div className="admin-notice-box">
        <span>
          ⓘ Nhật ký ghi tự động mọi lần tiền thay đổi (tạm giữ, giải ngân, hoàn tiền, chiết khấu, ghi nợ) và mọi quyết định khiếu nại.
          Dữ liệu chỉ đọc – không thể sửa hoặc xóa.
        </span>
      </div>
    </div>
  );
}
