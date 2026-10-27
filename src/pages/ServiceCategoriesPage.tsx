import ConfirmDialog from '../components/common/ConfirmDialog';
import ServiceFormPanel from '../components/services/ServiceFormPanel';
import ServiceTable from '../components/services/ServiceTable';
import { useServiceCatalog } from '../hooks/useServiceCatalog';

// EP02 - US07/US08/US09/US11: Thêm/sửa/xóa danh mục dịch vụ & bảng giá
export default function ServiceCategoriesPage() {
  const {
    items,
    units,
    statusFilter,
    unitFilter,
    statusCounts,
    onStatusFilter,
    onUnitFilter,
    restoreTarget,
    isRestoring,
    onPromptRestore,
    onCancelRestore,
    onConfirmRestore,
    keyword,
    page,
    pageSize,
    setPage,
    setPageSize,
    selectedItem,
    isLoading,
    isSubmitting,
    deleteTarget,
    isDeleting,
    isExporting,
    onSearch,
    onSelectForEdit,
    onResetForm,
    onSave,
    onPromptDelete,
    onCancelDelete,
    onConfirmDelete,
    onExportExcel,
  } = useServiceCatalog();

  return (
    <div className="service-categories-page">
      <div className="service-split-layout">
        <div className="service-left-pane">
          <ServiceTable
            items={items}
            totalRecords={items.length}
            currentPage={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            selectedId={selectedItem?.id ?? null}
            isLoading={isLoading}
            keyword={keyword}
            onSearch={onSearch}
            onAddNew={onResetForm}
            onEdit={onSelectForEdit}
            onDelete={onPromptDelete}
            onRestore={onPromptRestore}
            units={units}
            statusFilter={statusFilter}
            unitFilter={unitFilter}
            statusCounts={statusCounts}
            onStatusFilter={onStatusFilter}
            onUnitFilter={onUnitFilter}
            onExportExcel={onExportExcel}
            isExporting={isExporting}
          />
        </div>

        <div className="service-right-pane">
          <ServiceFormPanel
            key={selectedItem?.id ?? 'create'}
            selectedItem={selectedItem}
            isSubmitting={isSubmitting}
            onSave={onSave}
            onCancel={onResetForm}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xóa dịch vụ"
        message={`Bạn có chắc chắn muốn xóa dịch vụ "${deleteTarget?.name}"? Dịch vụ sẽ bị ẩn khỏi khách hàng (đơn cũ không bị ảnh hưởng) và có thể khôi phục lại sau.`}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
      <ConfirmDialog
        isOpen={Boolean(restoreTarget)}
        title="Khôi phục dịch vụ"
        message={`Hiển thị lại dịch vụ "${restoreTarget?.name}" cho khách hàng đặt đơn?`}
        confirmText="Khôi phục"
        cancelText="Hủy"
        isLoading={isRestoring}
        onConfirm={onConfirmRestore}
        onCancel={onCancelRestore}
      />
    </div>
  );
}
