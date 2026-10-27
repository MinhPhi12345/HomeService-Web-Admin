import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, Eye, IdCard, Loader2, MapPin, Search, XCircle } from 'lucide-react';
import { getPendingTaskerVerifications, setTaskerVerification } from '../services/userService';
import type { PendingTaskerItem } from '../types';
import { useAdminCounters } from '../context/useAdminCounters';
import { useToast } from '../components/common/useToast';
import { useDebounce } from '../hooks/useDebounce';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Modal from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import PhotoGallery from '../components/common/PhotoGallery';
import TableSkeleton from '../components/common/TableSkeleton';
import { formatDateTime } from '../utils/formatters';
import { getErrorMessage } from '../utils/errorHandler';
import { exportToExcel } from '../utils/excelExport';

type Decision = { tasker: PendingTaskerItem; approve: boolean };

function normalize(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

// EP01 - US04: Xác thực hồ sơ Tasker
export default function TaskerVerificationPage() {
  const toast = useToast();
  const { refresh: refreshCounters } = useAdminCounters();
  const [items, setItems] = useState<PendingTaskerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [keyword, setKeyword] = useState('');
  const debounced = useDebounce(keyword, 250);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewing, setViewing] = useState<PendingTaskerItem | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [working, setWorking] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let ignore = false;
    getPendingTaskerVerifications()
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
    const kw = normalize(debounced.trim());
    return items
      .filter(
        (t) =>
          !kw ||
          normalize(t.fullName).includes(kw) ||
          normalize(t.email).includes(kw) ||
          (t.phoneNumber ?? '').includes(kw) ||
          t.idCardNumber.includes(kw) ||
          normalize(t.workingArea ?? '').includes(kw) ||
          normalize(t.skills ?? '').includes(kw),
      )
      .sort((a, b) => (a.submittedAt ?? '').localeCompare(b.submittedAt ?? ''));
  }, [items, debounced]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const doDecision = async () => {
    if (!decision) return;
    setWorking(true);
    try {
      await setTaskerVerification(decision.tasker.id, decision.approve);
      toast.success(
        decision.approve
          ? `Đã duyệt hồ sơ "${decision.tasker.fullName}". Tasker có thể bắt đầu nhận đơn.`
          : `Đã từ chối hồ sơ "${decision.tasker.fullName}".`,
      );
      setItems((prev) => prev.filter((x) => x.id !== decision.tasker.id));
      setDecision(null);
      setViewing(null);
      refreshCounters();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setWorking(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportToExcel<PendingTaskerItem>({
        fileNamePrefix: 'ho-so-tasker-cho-duyet',
        sheetName: 'Hồ sơ chờ duyệt',
        columns: [
          { header: 'Họ tên', key: 'fullName', width: 24 },
          { header: 'Email', key: 'email', width: 28 },
          { header: 'Số điện thoại', key: 'phoneNumber', width: 16 },
          { header: 'Số CCCD', key: 'idCardNumber', width: 16 },
          { header: 'Kỹ năng', key: 'skills', width: 30 },
          { header: 'Khu vực', key: 'workingArea', width: 20 },
          { header: 'Địa chỉ xuất phát', key: 'baseAddress', width: 40 },
          { header: 'Bán kính (km)', key: 'serviceRadiusKm', width: 14, format: 'number' },
          { header: 'Ngày gửi', key: 'submittedAt', width: 18, getValue: (t) => formatDateTime(t.submittedAt) },
        ],
        data: filtered,
      });
      toast.success(`Đã xuất ${filtered.length} hồ sơ ra Excel.`);
    } catch {
      toast.error('Lỗi khi xuất file Excel. Vui lòng thử lại.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="list-toolbar">
        <div className="search-input-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT, CCCD, kỹ năng…"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="toolbar-actions">
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
          <TableSkeleton rows={4} columns={7} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title={items.length === 0 ? 'Không có hồ sơ nào đang chờ duyệt' : 'Không tìm thấy hồ sơ phù hợp'}
            description={items.length === 0 ? 'Hồ sơ Tasker mới đăng ký sẽ xuất hiện tại đây để bạn xác minh CCCD.' : undefined}
          />
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 56, textAlign: 'center' }}>STT</th>
                  <th>Tasker</th>
                  <th>CCCD</th>
                  <th>Kỹ năng</th>
                  <th>Khu vực</th>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t, idx) => (
                  <tr key={t.id}>
                    <td style={{ textAlign: 'center', color: 'var(--ink-400)' }}>{(safePage - 1) * pageSize + idx + 1}</td>
                    <td>
                      <div className="font-medium">{t.fullName}</div>
                      <div className="cell-sub">{t.email}{t.phoneNumber ? ` · ${t.phoneNumber}` : ''}</div>
                    </td>
                    <td>{t.idCardNumber}</td>
                    <td>
                      <span className="cell-ellipsis" title={t.skills ?? ''}>{t.skills ?? '—'}</span>
                    </td>
                    <td>{t.workingArea ?? '—'}</td>
                    <td>{formatDateTime(t.submittedAt) || '—'}</td>
                    <td>
                      <Badge variant="warning">Chờ duyệt</Badge>
                    </td>
                    <td>
                      <div className="action-row">
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setViewing(t)}>
                          <Eye size={14} /> <span>Hồ sơ</span>
                        </button>
                        <button type="button" className="btn-action-pill btn-unlock" onClick={() => setDecision({ tasker: t, approve: true })}>
                          Duyệt
                        </button>
                        <button type="button" className="btn-action-pill btn-lock" onClick={() => setDecision({ tasker: t, approve: false })}>
                          Từ chối
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
        <span>ⓘ Đối chiếu họ tên và số CCCD với ảnh giấy tờ trước khi duyệt. Tasker chỉ nhận được đơn sau khi hồ sơ được duyệt.</span>
      </div>

      <Modal
        isOpen={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing ? `Hồ sơ Tasker: ${viewing.fullName}` : ''}
        maxWidth={720}
        footer={
          viewing && (
            <div className="confirm-dialog-actions">
              <Button variant="outline" onClick={() => setViewing(null)}>Đóng</Button>
              <Button variant="danger" icon={<XCircle size={16} />} onClick={() => setDecision({ tasker: viewing, approve: false })}>
                Từ chối
              </Button>
              <Button icon={<CheckCircle2 size={16} />} onClick={() => setDecision({ tasker: viewing, approve: true })}>
                Duyệt hồ sơ
              </Button>
            </div>
          )
        }
      >
        {viewing && (
          <div className="dispute-detail">
            <div className="info-grid">
              <div><span>Họ tên</span><strong>{viewing.fullName}</strong></div>
              <div><span>Số CCCD</span><strong>{viewing.idCardNumber}</strong></div>
              <div><span>Email</span><strong>{viewing.email}</strong></div>
              <div><span>Số điện thoại</span><strong>{viewing.phoneNumber ?? '—'}</strong></div>
              <div className="span-2"><span>Kỹ năng</span><strong>{viewing.skills ?? '—'}</strong></div>
              <div><span>Khu vực làm việc</span><strong>{viewing.workingArea ?? '—'}</strong></div>
              <div><span>Bán kính nhận đơn</span><strong>{viewing.serviceRadiusKm} km</strong></div>
              <div className="span-2">
                <span>Địa chỉ xuất phát</span>
                <strong>
                  {viewing.baseAddress || '—'}{' '}
                  {viewing.baseLatitude !== 0 && (
                    <a
                      className="link-btn"
                      href={`https://www.openstreetmap.org/?mlat=${viewing.baseLatitude}&mlon=${viewing.baseLongitude}#map=16/${viewing.baseLatitude}/${viewing.baseLongitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MapPin size={13} /> Xem bản đồ
                    </a>
                  )}
                </strong>
              </div>
              <div><span>Ngày gửi hồ sơ</span><strong>{formatDateTime(viewing.submittedAt) || '—'}</strong></div>
            </div>
            <section className="detail-section">
              <h4>
                <IdCard size={16} /> Ảnh CCCD
              </h4>
              <PhotoGallery urls={[viewing.idCardImageUrl]} labels={['CCCD']} emptyText="Tasker chưa tải ảnh CCCD" />
            </section>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(decision)}
        title={decision?.approve ? 'Duyệt hồ sơ Tasker?' : 'Từ chối hồ sơ Tasker?'}
        message={
          decision?.approve
            ? `"${decision.tasker.fullName}" sẽ được kích hoạt và bắt đầu nhận đơn trong khu vực ${decision.tasker.workingArea ?? 'đã đăng ký'}.`
            : `Hồ sơ của "${decision?.tasker.fullName}" sẽ bị từ chối. Tasker cần cập nhật lại thông tin để gửi duyệt lần nữa.`
        }
        confirmText={decision?.approve ? 'Duyệt' : 'Từ chối'}
        confirmVariant={decision?.approve ? 'primary' : 'danger'}
        isLoading={working}
        onConfirm={doDecision}
        onCancel={() => setDecision(null)}
      />
    </div>
  );
}
