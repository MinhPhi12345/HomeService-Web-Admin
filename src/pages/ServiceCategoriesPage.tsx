import ConfirmDialog from '../components/common/ConfirmDialog';
import ServiceFormPanel from '../components/services/ServiceFormPanel';
import ServiceTable from '../components/services/ServiceTable';
import { useServiceCatalog } from '../hooks/useServiceCatalog';

// EP02 - US07/US08/US09/US11: Thêm/sửa/xóa danh mục dịch vụ & bảng giá
export default function ServiceCategoriesPage() {
  const {
    items,
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
        message={`Bạn có chắc chắn muốn xóa dịch vụ "${deleteTarget?.name}"? Thao tác này sẽ ẩn dịch vụ khỏi khách hàng.`}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </div>
  );
}
