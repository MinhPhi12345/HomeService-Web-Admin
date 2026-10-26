import { Download, Loader2 } from 'lucide-react';

interface RevenueFilterToolbarProps {
  fromDate: string;
  toDate: string;
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
  onQuickSelect: (days: number) => void;
  onExportExcel: () => void;
  isExporting: boolean;
}

export default function RevenueFilterToolbar({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  onQuickSelect,
  onExportExcel,
  isExporting,
}: RevenueFilterToolbarProps) {
  return (
    <div className="list-toolbar">
      <div className="filter-dates-group">
        <div className="date-input-item">
          <label className="date-label">Từ</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromChange(e.target.value)}
            className="input-date"
          />
        </div>
        <div className="date-input-item">
          <label className="date-label">Đến</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToChange(e.target.value)}
            className="input-date"
          />
        </div>

        <div className="quick-filter-buttons">
          <button
            type="button"
            className="btn-quick-filter"
            onClick={() => onQuickSelect(0)}
          >
            Hôm nay
          </button>
          <button
            type="button"
            className="btn-quick-filter"
            onClick={() => onQuickSelect(7)}
          >
            7 ngày
          </button>
          <button
            type="button"
            className="btn-quick-filter active"
            onClick={() => onQuickSelect(30)}
          >
            Tháng này
          </button>
        </div>
      </div>

      <div className="toolbar-actions">
        <button
          type="button"
          className="btn-excel"
          onClick={onExportExcel}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          <span>{isExporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
        </button>
      </div>
    </div>
  );
}
