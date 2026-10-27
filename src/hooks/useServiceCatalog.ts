import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../components/common/useToast';
import {
  createServiceCategory,
  deleteServiceCategory,
  getServiceCategories,
  restoreServiceCategory,
  updateServiceCategory,
} from '../services/serviceCatalogService';
import type { ServiceCategoryResponse, UpsertServiceCategoryRequest } from '../types';
import { exportToExcel } from '../utils/excelExport';
import { getErrorMessage } from '../utils/errorHandler';

export type ServiceStatusFilter = 'all' | 'active' | 'inactive';

export function useServiceCatalog() {
  const [allItems, setItems] = useState<ServiceCategoryResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState<ServiceStatusFilter>('all');
  const [unitFilter, setUnitFilter] = useState<string>('');
  const [restoreTarget, setRestoreTarget] = useState<ServiceCategoryResponse | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
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

  const units = useMemo(
    () => Array.from(new Set(allItems.map((i) => i.unit))).sort((a, b) => a.localeCompare(b, 'vi')),
    [allItems],
  );

  // Lọc theo trạng thái (phân loại màu) và theo đơn vị tính (loại dịch vụ)
  const items = useMemo(
    () =>
      allItems
        .filter((i) => (statusFilter === 'all' ? true : statusFilter === 'active' ? i.isActive : !i.isActive))
        .filter((i) => !unitFilter || i.unit === unitFilter)
        .sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name, 'vi')),
    [allItems, statusFilter, unitFilter],
  );

  const statusCounts = useMemo(
    () => ({
      all: allItems.length,
      active: allItems.filter((i) => i.isActive).length,
      inactive: allItems.filter((i) => !i.isActive).length,
    }),
    [allItems],
  );

  const handleConfirmRestore = useCallback(async () => {
    if (!restoreTarget) return;
    setIsRestoring(true);
    try {
      await restoreServiceCategory(restoreTarget.id);
      toast.success(`Đã khôi phục dịch vụ "${restoreTarget.name}".`);
      setRestoreTarget(null);
      setIsLoading(true);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsRestoring(false);
    }
  }, [restoreTarget, toast]);

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
      const allFiltered = items;
      await exportToExcel({
        fileNamePrefix: 'danh-muc-dich-vu',
        sheetName: 'Dịch vụ',
        columns: [
          { header: 'Tên dịch vụ', key: 'name', width: 30 },
          { header: 'Mô tả', key: 'description', width: 40 },
          { header: 'Giá cơ bản', key: 'basePrice', width: 18, format: 'currency' },
          { header: 'Đơn vị', key: 'unit', width: 12 },
          { header: 'Trạng thái', key: 'isActive', width: 16, getValue: (s) => (s.isActive ? 'Đang hoạt động' : 'Đã ẩn') },
        ],
        data: allFiltered,
      });
      toast.success('Xuất danh mục dịch vụ ra Excel thành công.');
    } catch {
      toast.error('Lỗi khi xuất file Excel. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  }, [items, toast]);

  return {
    items,
    units,
    statusFilter,
    unitFilter,
    statusCounts,
    onStatusFilter: (v: ServiceStatusFilter) => {
      setStatusFilter(v);
      setPage(1);
    },
    onUnitFilter: (v: string) => {
      setUnitFilter(v);
      setPage(1);
    },
    restoreTarget,
    isRestoring,
    onPromptRestore: (item: ServiceCategoryResponse) => setRestoreTarget(item),
    onCancelRestore: () => setRestoreTarget(null),
    onConfirmRestore: handleConfirmRestore,
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
