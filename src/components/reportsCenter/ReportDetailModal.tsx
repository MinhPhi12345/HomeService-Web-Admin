import { AlertCircle, Printer, X } from 'lucide-react';
import type { PrintSlipPayload, ReportDetailPayload } from '../../types/reportsCenter';
import { formatVnd } from '../../utils/formatters';

interface ReportDetailModalProps {
  payload: ReportDetailPayload | null;
  onClose: () => void;
  onPrintSlip: (slip: PrintSlipPayload) => void;
}

export default function ReportDetailModal({
  payload,
  onClose,
  onPrintSlip,
}: ReportDetailModalProps) {
  if (!payload) return null;

  const handlePrint = () => {
    const slip: PrintSlipPayload = {
      slipCode: `PH-${Date.now().toString().slice(-6)}`,
      title: payload.title,
      reportName: 'Báo cáo chi tiết phân hệ Quản trị HomeService',
      printedAt: new Date().toLocaleString('vi-VN'),
      metaFields: payload.summaryStats.map((s) => ({ label: s.label, value: String(s.value) })),
      details: payload.rows.slice(0, 8).map((r, i) => {
        const firstCol = payload.columns[0]?.key;
        const secondCol = payload.columns[1]?.key;
        return {
          label: `${i + 1}. ${String(r[firstCol] ?? '')}`,
          value: String(r[secondCol] ?? ''),
        };
      }),
      notes: payload.isLimitedApiNotice
        ? 'Dữ liệu được trích xuất từ API hệ thống HomeService hiện hữu.'
        : 'Phiếu in đối soát nội bộ phục vụ công tác quản lý vận hành dịch vụ.',
    };
    onPrintSlip(slip);
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
            {payload.summaryStats.map((st, i) => (
              <div key={i} className="detail-stat-card">
                <span className="detail-stat-label">{st.label}</span>
                <span className="detail-stat-value">{st.value}</span>
              </div>
            ))}
          </div>

          {payload.isLimitedApiNotice && (
            <div className="notice-box-warning">
              <AlertCircle size={16} />
              <span>
                Lưu ý: Dữ liệu chi tiết tổng hợp từ API hiện có. Backend chưa cung cấp chi tiết từng bản ghi con.
              </span>
            </div>
          )}

          <div className="table-responsive modal-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  {payload.columns.map((c) => (
                    <th key={c.key}>{c.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payload.rows.map((row, idx) => (
                  <tr key={idx}>
                    {payload.columns.map((col) => {
                      const val = row[col.key];
                      const formatted = col.format === 'currency' && typeof val === 'number'
                        ? formatVnd(val)
                        : String(val ?? '—');
                      return <td key={col.key}>{formatted}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Đóng
          </button>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>In phiếu chi tiết</span>
          </button>
        </div>
      </div>
    </div>
  );
}
