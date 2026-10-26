import { Download, Loader2, Search } from 'lucide-react';

interface UserFilterTabsProps {
  currentRole: string | null;
  onRoleChange: (role: string | null) => void;
  keyword: string;
  onSearchChange: (kw: string) => void;
  onExportExcel: () => void;
  isExporting: boolean;
  totalRecords: number;
}

const roleTabs = [
  { label: 'Tất cả', value: null },
  { label: 'Khách hàng', value: 'Customer' },
  { label: 'Tasker', value: 'Tasker' },
  { label: 'Admin', value: 'Admin' },
];

export default function UserFilterTabs({
  currentRole,
  onRoleChange,
  keyword,
  onSearchChange,
  onExportExcel,
  isExporting,
  totalRecords,
}: UserFilterTabsProps) {
  return (
    <div className="list-toolbar">
      <div className="role-tab-group">
        {roleTabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`role-tab-btn ${currentRole === tab.value ? 'active' : ''}`}
            onClick={() => onRoleChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="toolbar-actions">
        <div className="search-input-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={keyword}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn-excel"
          onClick={onExportExcel}
          disabled={isExporting || totalRecords === 0}
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          <span>{isExporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
        </button>
      </div>
    </div>
  );
}
