import { useEffect, useState } from 'react';
import { Download, Loader2, Printer, X } from 'lucide-react';
import type { PrintSlipPayload, ReportDetailPayload } from '../../types/reportsCenter';
import { formatVnd } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelExport';
import { getErrorMessage } from '../../utils/errorHandler';
import { useToast } from '../common/useToast';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';

interface ReportDetailModalProps {
  payload: ReportDetailPayload | null;
  onClose: () => void;
  onPrintSlip?: (slip: PrintSlipPayload) => void;
}

type Row = Record<string, string | number>;

export default function ReportDetailModal({ payload, onClose, onPrintSlip }: ReportDetailModalProps) {
  if (!payload) return null;
  // key = tiêu đề → mỗi lần mở chi tiết khác sẽ tải lại từ đầu
  return <DetailContent key={payload.title} payload={payload} onClose={onClose} onPrintSlip={onPrintSlip} />;
}

function DetailContent({
  payload,
  onClose,
  onPrintSlip,
}: {
  payload: ReportDetailPayload;
  onClose: () => void;
  onPrintSlip?: (slip: PrintSlipPayload) => void;
}) {
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>(payload.rows);
  const [loading, setLoading] = useState<boolean>(Boolean(payload.loadRows));
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!payload.loadRows) return;
    let ignore = false;
    payload
      .loadRows()
      .then((data) => {
        if (!ignore) {
          setRows(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [payload, reload]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const formatCell = (row: Row, key: string, format?: string) => {
    const val = row[key];
    return format === 'currency' && typeof val === 'number' ? formatVnd(val) : String(val ?? '—');
  };

  const handlePrint = () => {
    if (!onPrintSlip) return;
    const cols = payload.columns.slice(0, 4);
    const slip: PrintSlipPayload = {
      slipCode: `PH-${Date.now().toString().slice(-6)}`,
      title: payload.title,
      reportName: 'Phiếu chi tiết báo cáo – Hệ thống quản trị HomeService',
      printedAt: new Date().toLocaleString('vi-VN'),
      metaFields: payload.summaryStats.map((s) => ({ label: s.label, value: String(s.value) })),
      details: rows.slice(0, 30).map((r, i) => ({
        label: `${i + 1}. ${formatCell(r, cols[0]?.key ?? '', cols[0]?.format)} – ${formatCell(r, cols[1]?.key ?? '', cols[1]?.format)}`,
        value: cols
          .slice(2)
          .map((c) => formatCell(r, c.key, c.format))
          .join(' · '),
      })),
      notes:
        rows.length > 30
          ? `Phiếu in 30/${rows.length} bản ghi đầu tiên. Xuất Excel để có toàn bộ danh sách.`
          : `Tổng cộng ${rows.length} bản ghi, trích xuất trực tiếp từ dữ liệu hệ thống HomeService.`,
    };
    onPrintSlip(slip);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportToExcel<Row>({
        fileNamePrefix: (payload.exportName ?? 'chi-tiet-bao-cao').replace(/\s+/g, '-').toLowerCase(),
        sheetName: 'Chi tiết',
        columns: payload.columns.map((c) => ({
          header: c.header,
          key: c.key,
          width: c.format === 'currency' ? 16 : c.key === 'address' ? 36 : 22,
          format: c.format === 'currency' ? 'currency' : c.format === 'number' ? 'number' : 'text',
        })),
        data: rows,
      });
      toast.success('Đã xuất danh sách chi tiết ra Excel.');
    } catch {
      toast.error('Lỗi khi xuất file Excel. Vui lòng thử lại.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="modal-backdrop show no-print" onClick={onClose} aria-modal="true" role="dialog">
      <div className="modal-box report-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{payload.title}</h3>
            <p className="modal-subtitle">{payload.subtitle}</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-stat-row">
            {payload.summaryStats.map((st) => (
              <div key={st.label} className="detail-stat-card">
                <span className="detail-stat-label">{st.label}</span>
                <span className="detail-stat-value">{st.value}</span>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="detail-loading">
              <Loader2 size={18} className="animate-spin" />
              <span>Đang tải danh sách chi tiết…</span>
            </div>
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={() => {
                setLoading(true);
                setReload((x) => x + 1);
              }}
            />
          ) : rows.length === 0 ? (
            <EmptyState title={payload.emptyText ?? 'Không có bản ghi nào.'} />
          ) : (
            <>
              <p className="detail-count">{rows.length.toLocaleString('vi-VN')} bản ghi</p>
              <div className="table-responsive modal-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: 48, textAlign: 'center' }}>STT</th>
                      {payload.columns.map((c) => (
                        <th key={c.key} style={c.format === 'currency' ? { textAlign: 'right' } : undefined}>
                          {c.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', color: 'var(--ink-400)' }}>{idx + 1}</td>
                        {payload.columns.map((col) => (
                          <td
                            key={col.key}
                            style={col.format === 'currency' ? { textAlign: 'right', fontWeight: 600 } : undefined}
                          >
                            {formatCell(row, col.key, col.format)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline btn-md" onClick={onClose}>
            Đóng
          </button>
          <button
            type="button"
            className="btn btn-outline btn-md"
            onClick={handleExport}
            disabled={loading || exporting || rows.length === 0}
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>Xuất Excel</span>
          </button>
          {onPrintSlip && (
            <button type="button" className="btn btn-primary btn-md" onClick={handlePrint} disabled={loading}>
              <Printer size={16} />
              <span>In phiếu chi tiết</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
