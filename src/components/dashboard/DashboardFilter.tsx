import { DASHBOARD_LABELS } from '../../utils/constants';

interface DashboardFilterProps {
  selectedDays: number;
  onChange: (days: number) => void;
  disabled?: boolean;
}

const FILTER_OPTIONS = [
  { value: 7, label: DASHBOARD_LABELS.FILTER_7_DAYS },
  { value: 30, label: DASHBOARD_LABELS.FILTER_30_DAYS },
  { value: 90, label: DASHBOARD_LABELS.FILTER_90_DAYS },
];

export default function DashboardFilter({
  selectedDays,
  onChange,
  disabled = false,
}: DashboardFilterProps) {
  return (
    <div className="dashboard-filter-group" role="group">
      {FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`filter-btn ${selectedDays === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
          disabled={disabled}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
