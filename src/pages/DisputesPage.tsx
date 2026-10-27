import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Eye, Loader2, Search } from 'lucide-react';
import type { DisputeResponse } from '../types';
import { DisputeStatus } from '../types';
import { getDisputes } from '../services/disputeService';
import { useAdminCounters } from '../context/useAdminCounters';
import { useToast } from '../components/common/useToast';
import { useDebounce } from '../hooks/useDebounce';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Pagination from '../components/common/Pagination';
import TableSkeleton from '../components/common/TableSkeleton';
import DisputeDetailModal from '../components/disputes/DisputeDetailModal';
import {
  DISPUTE_REASON_LABELS,
  DISPUTE_RESOLUTION_LABELS,
  DISPUTE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from '../utils/statusLabels';
import { formatDateTime, formatVnd } from '../utils/formatters';
import { getErrorMessage } from '../utils/errorHandler';
import { exportToExcel } from '../utils/excelExport';

type Tab = 'open' | 'resolved' | 'all';

const TABS: { key: Tab; label: string }[] = [
  { key: 'open', label: 'Chờ xử lý' },
  { key: 'resolved', label: 'Đã xử lý' },
  { key: 'all', label: 'Tất cả' },
];

function normalize(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

export default function DisputesPage() {
  const toast = useToast();
  const { refresh: refreshCounters } = useAdminCounters();
  const [all, setAll] = useState<DisputeResponse[]>([]);
  const [tab, setTab] = useState<Tab>('open');
  const [keyword, setKeyword] = useState('');
  const debounced = useDebounce(keyword, 250);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let ignore = false;
    getDisputes()
      .then((data) => {
        if (!ignore) {
          setAll(data);
          setError(null);
        }
      })
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [reload]);

  const counts = useMemo(
    () => ({
      open: all.filter((d) => d.status === DisputeStatus.Open).length,
      resolved: all.filter((d) => d.status === DisputeStatus.Resolved).length,
      all: all.length,
    }),
    [all],
  );

  const filtered = useMemo(() => {
    const kw = normalize(debounced.trim().replace(/^#/, ''));
    return all
      .filter((d) =>
        tab === 'all' ? true : tab === 'open' ? d.status === DisputeStatus.Open : d.status === DisputeStatus.Resolved,
      )
      .filter(
        (d) =>
          !kw ||
          normalize(d.customerName).includes(kw) ||
          normalize(d.taskerName).includes(kw) ||
          String(d.bookingId) === kw ||
          String(d.id) === kw,
      )
      .sort((a, b) =>
        // chờ xử lý: hạn phản hồi gần nhất trước; còn lại: mới nhất trước
        a.status === DisputeStatus.Open && b.status === DisputeStatus.Open
          ? a.createdAt.localeCompare(b.createdAt)
          : b.createdAt.localeCompare(a.createdAt),
      );
  }, [all, tab, debounced]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleResolved = useCallback(() => {
    setSelectedId(null);
    setLoading(true);
    setReload((x) => x + 1);
    refreshCounters();
  }, [refreshCounters]);

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportToExcel<DisputeResponse>({
        fileNamePrefix: 'danh-sach-khieu-nai',
        sheetName: 'Khiếu nại',
        columns: [
          { header: 'Mã KN', key: 'id', width: 10, getValue: (d) => `KN-${d.id}` },
          { header: 'Mã đơn', key: 'bookingId', width: 10, getValue: (d) => `#${d.bookingId}` },
          { header: 'Khách hàng', key: 'customerName', width: 24 },
          { header: 'Tasker', key: 'taskerName', width: 24 },
          { header: 'Lý do', key: 'reason', width: 28, getValue: (d) => DISPUTE_REASON_LABELS[d.reason] },
          { header: 'Mô tả', key: 'description', width: 40 },
          { header: 'Số tiền', key: 'amount', width: 14, format: 'currency' },
          { header: 'Thanh toán', key: 'paymentMethod', width: 16, getValue: (d) => PAYMENT_METHOD_LABELS[d.paymentMethod] },
          { header: 'Trạng thái', key: 'status', width: 14, getValue: (d) => DISPUTE_STATUS_LABELS[d.status].label },
          { header: 'Kết quả', key: 'resolution', width: 30, getValue: (d) => (d.resolution != null ? DISPUTE_RESOLUTION_LABELS[d.resolution] : '') },
          { header: 'Hoàn tiền', key: 'refundAmount', width: 14, format: 'currency' },
          { header: 'Ghi chú Admin', key: 'adminNote', width: 40 },
          { header: 'Ngày tạo', key: 'createdAt', width: 18, getValue: (d) => formatDateTime(d.createdAt) },
          { header: 'Ngày xử lý', key: 'resolvedAt', width: 18, getValue: (d) => formatDateTime(d.resolvedAt) },
        ],
        data: filtered,
      });
      toast.success(`Đã xuất ${filtered.length} khiếu nại ra Excel.`);
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
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`role-tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
            >
              {t.label}
              <span className="tab-count">{counts[t.key]}</span>
            </button>
          ))}
        </div>
        <div className="toolbar-actions">
          <div className="search-input-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo khách hàng, Tasker hoặc mã đơn…"
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
          <TableSkeleton rows={5} columns={8} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title={tab === 'open' ? 'Không có khiếu nại nào đang chờ xử lý' : 'Không tìm thấy khiếu nại phù hợp'}
            description={tab === 'open' ? 'Khi khách hàng khiếu nại một đơn, hồ sơ sẽ xuất hiện tại đây.' : undefined}
          />
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 56, textAlign: 'center' }}>STT</th>
                  <th>Mã KN</th>
                  <th>Đơn</th>
                  <th>Khách hàng</th>
                  <th>Tasker</th>
                  <th>Lý do</th>
                  <th style={{ textAlign: 'right' }}>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d, idx) => {
                  const meta = DISPUTE_STATUS_LABELS[d.status];
                  const overdue = d.status === DisputeStatus.Open && new Date(d.taskerResponseDueAt) < new Date();
                  return (
                    <tr key={d.id} className="row-clickable" onClick={() => setSelectedId(d.id)}>
                      <td style={{ textAlign: 'center', color: 'var(--ink-400)' }}>{(safePage - 1) * pageSize + idx + 1}</td>
                      <td className="font-medium">KN-{d.id}</td>
                      <td>#{d.bookingId}</td>
                      <td>{d.customerName}</td>
                      <td>{d.taskerName}</td>
                      <td>
                        <span className="cell-ellipsis" title={d.description}>
                          {DISPUTE_REASON_LABELS[d.reason]}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="font-medium">{formatVnd(d.amount)}</div>
                        <div className="cell-sub">{PAYMENT_METHOD_LABELS[d.paymentMethod]}</div>
                      </td>
                      <td>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                        {d.status === DisputeStatus.Open && (
                          <div className={`cell-sub ${d.taskerResponse ? 'text-success' : overdue ? 'text-danger' : ''}`}>
                            {d.taskerResponse ? 'Tasker đã phản hồi' : overdue ? 'Tasker quá hạn phản hồi' : 'Chờ Tasker phản hồi'}
                          </div>
                        )}
                        {d.status === DisputeStatus.Resolved && d.resolution != null && (
                          <div className="cell-sub">{DISPUTE_RESOLUTION_LABELS[d.resolution]}</div>
                        )}
                      </td>
                      <td>
                        <div>{formatDateTime(d.createdAt)}</div>
                        {d.resolvedAt && <div className="cell-sub">Xử lý: {formatDateTime(d.resolvedAt)}</div>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className={`btn btn-sm ${d.status === DisputeStatus.Open ? 'btn-primary' : 'btn-outline'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(d.id);
                          }}
                        >
                          <Eye size={14} />
                          <span>{d.status === DisputeStatus.Open ? 'Xử lý' : 'Xem'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
          ⓘ Đơn tiền mặt chỉ có thể bác khiếu nại hoặc yêu cầu làm lại. Khiếu nại được chấp nhận (hoàn tiền / làm lại) sẽ cộng 1
          điểm vi phạm cho Tasker. Mọi quyết định được ghi vào Nhật ký kiểm toán.
        </span>
      </div>

      {selectedId !== null && (
        <DisputeDetailModal disputeId={selectedId} onClose={() => setSelectedId(null)} onResolved={handleResolved} />
      )}
    </div>
  );
}
