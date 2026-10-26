import { Download, Loader2, Printer, RefreshCw } from 'lucide-react';
import { QUICK_DATE_PRESETS } from '../../utils/reportsCenterConstants';

interface ReportsFilterBarProps {
  dateFrom: string;
  dateTo: string;
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
  onQuickPreset: (days: number) => void;
  onPrint: () => void;
  onExport: () => void;
  onRetry: () => void;
  isExporting: boolean;
  showDateFilter?: boolean;
}

export default function ReportsFilterBar({
  dateFrom,
  dateTo,
  onFromChange,
  onToChange,
  onQuickPreset,
  onPrint,
  onExport,
  onRetry,
  isExporting,
  showDateFilter = true,
}: ReportsFilterBarProps) {
  return (
    <div className="card reports-filter-bar no-print">
      <div className="filter-left-section">
        {showDateFilter && (
          <>
            <div className="date-input-group">
              <label htmlFor="report-from" className="filter-label">Từ ngày:</label>
              <input
                id="report-from"
                type="date"
                className="input-date"
                value={dateFrom}
                onChange={(e) => onFromChange(e.target.value)}
              />
            </div>

            <div className="date-input-group">
              <label htmlFor="report-to" className="filter-label">Đến ngày:</label>
              <input
                id="report-to"
                type="date"
                className="input-date"
                value={dateTo}
                onChange={(e) => onToChange(e.target.value)}
              />
            </div>

            <div className="quick-presets-group">
              {QUICK_DATE_PRESETS.map((p) => (
                <button
                  key={p.days}
                  type="button"
                  className="preset-pill-btn"
                  onClick={() => onQuickPreset(p.days)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="filter-actions-section">
        <button
          type="button"
          className="btn btn-outline btn-sm action-btn"
          onClick={onRetry}
          title="Tải lại dữ liệu"
        >
          <RefreshCw size={15} />
          <span>Làm mới</span>
        </button>

        <button
          type="button"
          className="btn btn-outline btn-sm action-btn"
          onClick={onPrint}
          title="In toàn bộ báo cáo"
        >
          <Printer size={15} />
          <span>In báo cáo</span>
        </button>

        <button
          type="button"
          className="btn btn-primary btn-sm action-btn"
          onClick={onExport}
          disabled={isExporting}
          title="Xuất bảng số liệu ra file Excel"
        >
          {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          <span>{isExporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
        </button>
      </div>
    </div>
  );
}
