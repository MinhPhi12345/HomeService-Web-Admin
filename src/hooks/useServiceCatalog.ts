import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../components/common/useToast';
import {
  createServiceCategory,
  deleteServiceCategory,
  getServiceCategories,
  updateServiceCategory,
} from '../services/serviceCatalogService';
import type { ServiceCategoryResponse, UpsertServiceCategoryRequest } from '../types';
import { exportToExcel } from '../utils/excelExport';
import { getErrorMessage } from '../utils/errorHandler';

export function useServiceCatalog() {
  const [items, setItems] = useState<ServiceCategoryResponse[]>([]);
  const [keyword, setKeyword] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedItem, setSelectedItem] = useState<ServiceCategoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<ServiceCategoryResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const toast = useToast();

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      getServiceCategories(keyword)
        .then((data) => {
          if (!ignore) {
            setItems(data);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (!ignore) {
            toast.error(getErrorMessage(err));
            setIsLoading(false);
          }
        });
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [keyword, reloadTrigger, toast]);

  const handleSearch = useCallback((kw: string) => {
    setIsLoading(true);
    setKeyword(kw);
    setPage(1);
  }, []);

  const handleSave = useCallback(
    async (payload: UpsertServiceCategoryRequest) => {
      setIsSubmitting(true);
      try {
        if (selectedItem) {
          await updateServiceCategory(selectedItem.id, payload);
          toast.success('Cập nhật dịch vụ thành công.');
        } else {
          await createServiceCategory(payload);
          toast.success('Thêm dịch vụ thành công.');
        }
        setSelectedItem(null);
        setIsLoading(true);
        setReloadTrigger((prev) => prev + 1);
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedItem, toast],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteServiceCategory(deleteTarget.id);
      toast.success('Xóa dịch vụ thành công.');
      if (selectedItem?.id === deleteTarget.id) setSelectedItem(null);
      setDeleteTarget(null);
      setIsLoading(true);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, selectedItem, toast]);

  const handleExportExcel = useCallback(async () => {
    try {
      setIsExporting(true);
      const allFiltered = await getServiceCategories(keyword);
      await exportToExcel({
        fileNamePrefix: 'danh-muc-dich-vu',
        sheetName: 'Dịch vụ',
        columns: [
          { header: 'Tên dịch vụ', key: 'name', width: 30 },
          { header: 'Mô tả', key: 'description', width: 40 },
          { header: 'Giá cơ bản', key: 'basePrice', width: 18, format: 'currency' },
          { header: 'Đơn vị', key: 'unit', width: 12 },
          { header: 'Trạng thái', key: 'isActive', width: 16, getValue: (s) => (s.isActive ? 'Đang bật' : 'Đã ẩn') },
        ],
        data: allFiltered,
      });
      toast.success('Xuất danh mục dịch vụ ra Excel thành công.');
    } catch {
      toast.error('Lỗi khi xuất file Excel. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  }, [keyword, toast]);

  return {
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
    onSearch: handleSearch,
    onSelectForEdit: (item: ServiceCategoryResponse) => setSelectedItem(item),
    onResetForm: () => setSelectedItem(null),
    onSave: handleSave,
    onPromptDelete: (item: ServiceCategoryResponse) => setDeleteTarget(item),
    onCancelDelete: () => setDeleteTarget(null),
    onConfirmDelete: handleConfirmDelete,
    onExportExcel: handleExportExcel,
  };
}
