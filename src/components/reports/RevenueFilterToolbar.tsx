import { Download, Loader2 } from 'lucide-react';

interface RevenueFilterToolbarProps {
  fromDate: string;
  toDate: string;
  activePreset: number | null;
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
  onQuickSelect: (days: number) => void;
  onExportExcel: () => void;
  isExporting: boolean;
}

const PRESETS = [
  { days: 1, label: 'Hôm nay' },
  { days: 7, label: '7 ngày' },
  { days: 30, label: '30 ngày' },
  { days: 90, label: '90 ngày' },
  { days: 365, label: '12 tháng' },
];

export default function RevenueFilterToolbar({
  fromDate,
  toDate,
  activePreset,
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
          <label className="date-label" htmlFor="rev-from">Từ</label>
          <input
            id="rev-from"
            type="date"
            value={fromDate}
            max={toDate}
            onChange={(e) => e.target.value && onFromChange(e.target.value)}
            className="input-date"
          />
        </div>
        <div className="date-input-item">
          <label className="date-label" htmlFor="rev-to">Đến</label>
          <input
            id="rev-to"
            type="date"
            value={toDate}
            min={fromDate}
            onChange={(e) => e.target.value && onToChange(e.target.value)}
            className="input-date"
          />
        </div>

        <div className="quick-filter-buttons">
          {PRESETS.map((p) => (
            <button
              key={p.days}
              type="button"
              className={`btn-quick-filter ${activePreset === p.days ? 'active' : ''}`}
              onClick={() => onQuickSelect(p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-actions">
        <button type="button" className="btn-excel" onClick={onExportExcel} disabled={isExporting}>
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          <span>{isExporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
        </button>
      </div>
    </div>
  );
}
