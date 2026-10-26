import { Download, Loader2, Plus, Search } from 'lucide-react';
import type { ServiceCategoryResponse } from '../../types';
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
  onExportExcel,
  isExporting,
}: ServiceTableProps) {
  const totalPages = Math.ceil(totalRecords / pageSize);
  const pagedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="card service-table-pane">
      <div className="table-top-header">
        <h2 className="table-count-title">{totalRecords} dịch vụ</h2>
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
        <EmptyState title="Không tìm thấy dịch vụ nào" />
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
