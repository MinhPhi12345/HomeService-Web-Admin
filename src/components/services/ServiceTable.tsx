import { Download, Loader2, Plus, Search } from 'lucide-react';
import type { ServiceCategoryResponse } from '../../types';
import type { ServiceStatusFilter } from '../../hooks/useServiceCatalog';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import TableSkeleton from '../common/TableSkeleton';
import ServiceTableRow from './ServiceTableRow';

interface ServiceTableProps {
  items: ServiceCategoryResponse[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  selectedId: number | null;
  isLoading: boolean;
  keyword: string;
  onSearch: (kw: string) => void;
  onAddNew: () => void;
  onEdit: (item: ServiceCategoryResponse) => void;
  onDelete: (item: ServiceCategoryResponse) => void;
  onRestore: (item: ServiceCategoryResponse) => void;
  units: string[];
  statusFilter: ServiceStatusFilter;
  unitFilter: string;
  statusCounts: Record<ServiceStatusFilter, number>;
  onStatusFilter: (v: ServiceStatusFilter) => void;
  onUnitFilter: (v: string) => void;
  onExportExcel: () => void;
  isExporting: boolean;
}

export default function ServiceTable({
  items,
  totalRecords,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  selectedId,
  isLoading,
  keyword,
  onSearch,
  onAddNew,
  onEdit,
  onDelete,
  onRestore,
  units,
  statusFilter,
  unitFilter,
  statusCounts,
  onStatusFilter,
  onUnitFilter,
  onExportExcel,
  isExporting,
}: ServiceTableProps) {
  const totalPages = Math.ceil(totalRecords / pageSize);
  const pagedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="card service-table-pane">
      <div className="table-top-header">
        <div className="role-tab-group">
          {(
            [
              ['all', 'Tất cả'],
              ['active', 'Đang hoạt động'],
              ['inactive', 'Đã ẩn'],
            ] as [ServiceStatusFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`role-tab-btn ${statusFilter === key ? 'active' : ''}`}
              onClick={() => onStatusFilter(key)}
            >
              {label}
              <span className="tab-count">{statusCounts[key]}</span>
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-primary" onClick={onAddNew}>
          <Plus size={16} />
          <span>Thêm dịch vụ</span>
        </button>
      </div>

      <div className="list-toolbar">
        <div className="search-input-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên dịch vụ..."
            value={keyword}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={unitFilter}
          onChange={(e) => onUnitFilter(e.target.value)}
          aria-label="Lọc theo đơn vị tính"
        >
          <option value="">Mọi đơn vị tính</option>
          {units.map((u) => (
            <option key={u} value={u}>
              Theo {u}
            </option>
          ))}
        </select>

        <div className="toolbar-actions">
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

      {isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : totalRecords === 0 ? (
        <EmptyState title="Không tìm thấy dịch vụ nào" description="Thử đổi từ khóa hoặc bộ lọc trạng thái / đơn vị." />
      ) : (
        <>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60, textAlign: 'center' }}>STT</th>
                  <th>Dịch vụ</th>
                  <th>Giá cơ bản</th>
                  <th>Đơn vị</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pagedItems.map((s, idx) => (
                  <ServiceTableRow
                    key={s.id}
                    item={s}
                    stt={(currentPage - 1) * pageSize + idx + 1}
                    isSelected={selectedId === s.id}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onRestore={onRestore}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      )}
    </div>
  );
}
