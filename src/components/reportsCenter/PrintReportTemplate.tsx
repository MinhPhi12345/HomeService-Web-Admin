import type { PrintSlipPayload, ReportKey } from '../../types/reportsCenter';
import { REPORT_TAB_LABELS } from '../../utils/reportsCenterConstants';

interface PrintReportTemplateProps {
  printSlip: PrintSlipPayload | null;
  activeTab: 'all' | ReportKey;
  dateFrom: string;
  dateTo: string;
}

export default function PrintReportTemplate({
  printSlip,
  activeTab,
  dateFrom,
  dateTo,
}: PrintReportTemplateProps) {
  const currentDateStr = new Date().toLocaleString('vi-VN');

  if (printSlip) {
    return (
      <div className="print-only">
        <div className="print-slip-container">
          <div className="print-slip-header">
            <div className="print-slip-brand">HomeService Platform</div>
            <div className="print-slip-title">{printSlip.title}</div>
            <div className="print-slip-code">Mã phiếu: {printSlip.slipCode} | Ngày in: {printSlip.printedAt}</div>
          </div>

          <div className="print-slip-meta-grid">
            {printSlip.metaFields.map((m, idx) => (
              <div key={idx}>
                <strong>{m.label}:</strong> {m.value}
              </div>
            ))}
          </div>

          <table className="print-slip-table">
            <thead>
              <tr>
                <th style={{ width: '60%' }}>Nội dung đối soát</th>
                <th style={{ width: '40%' }}>Thông tin chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {printSlip.details.map((d, idx) => (
                <tr key={idx}>
                  <td>{d.label}</td>
                  <td>{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {printSlip.notes && (
            <p style={{ fontSize: '10pt', fontStyle: 'italic', marginTop: '12px' }}>
              * Ghi chú: {printSlip.notes}
            </p>
          )}

          <div className="print-slip-footer">
            <div className="print-slip-signature-box">
              <strong>Người lập phiếu</strong>
              <p style={{ fontSize: '9pt' }}>(Ký và ghi rõ họ tên)</p>
              <div className="print-slip-signature-space" />
            </div>

            <div className="print-slip-signature-box">
              <strong>Quản trị viên xét duyệt</strong>
              <p style={{ fontSize: '9pt' }}>(Ký và đóng dấu)</p>
              <div className="print-slip-signature-space" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const reportTitle = REPORT_TAB_LABELS[activeTab] ?? 'Báo cáo tổng hợp';

  return (
    <div className="print-only">
      <div className="print-report-header">
        <h2 className="print-report-title">HỆ THỐNG QUẢN TRỊ HOMESERVICE</h2>
        <h3 style={{ fontSize: '14pt', margin: '6px 0' }}>{reportTitle}</h3>
        <div className="print-report-meta">
          <span>Khoảng thời gian: {dateFrom} đến {dateTo}</span>
          <span style={{ marginLeft: '24px' }}>Thời điểm in: {currentDateStr}</span>
        </div>
      </div>
    </div>
  );
}
