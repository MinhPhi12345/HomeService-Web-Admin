import { useCallback, useEffect, useState } from 'react';
import type { AdminUserItem } from '../types';
import { UserRole } from '../types';
import { getUsers, setUserActiveStatus } from '../services/userService';
import { useToast } from '../components/common/useToast';
import { exportToExcel } from '../utils/excelExport';
import { formatDate } from '../utils/formatters';

const ROLE_NAME_MAP: Record<number, string> = {
  [UserRole.Customer]: 'Khách hàng',
  [UserRole.Tasker]: 'Tasker',
  [UserRole.Admin]: 'Admin',
};

export function useUserManagement() {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [keyword, setKeyword] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [targetUser, setTargetUser] = useState<AdminUserItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      getUsers({
        role: roleFilter ?? undefined,
        keyword: keyword ? keyword.trim() : undefined,
      })
        .then((data) => {
          if (!ignore) {
            setUsers(data);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (!ignore) {
            toast.error('Không thể tải danh sách người dùng.');
            setIsLoading(false);
          }
        });
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [roleFilter, keyword, reloadTrigger, toast]);

  const handleRoleChange = (role: string | null) => {
    setIsLoading(true);
    setRoleFilter(role);
    setPage(1);
  };

  const handleSearchChange = (kw: string) => {
    setIsLoading(true);
    setKeyword(kw);
    setPage(1);
  };

  const handleConfirmToggleStatus = async () => {
    if (!targetUser) return;
    setIsUpdatingStatus(true);
    try {
      const nextStatus = !targetUser.isActive;
      await setUserActiveStatus(targetUser.id, nextStatus);
      toast.success(
        nextStatus
          ? `Đã mở khóa tài khoản "${targetUser.fullName}".`
          : `Đã khóa tài khoản "${targetUser.fullName}".`,
      );
      setTargetUser(null);
      setReloadTrigger((prev) => prev + 1);
    } catch {
      toast.error('Thao tác đổi trạng thái tài khoản thất bại.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportExcel = useCallback(async () => {
    try {
      setIsExporting(true);
      const allFiltered = await getUsers({
        role: roleFilter ?? undefined,
        keyword: keyword ? keyword.trim() : undefined,
      });

      await exportToExcel({
        fileNamePrefix: 'danh-sach-nguoi-dung',
        sheetName: 'Người dùng',
        columns: [
          { header: 'Họ tên', key: 'fullName', width: 28 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'Số điện thoại', key: 'phoneNumber', width: 18 },
          {
            header: 'Vai trò',
            key: 'role',
            width: 16,
            getValue: (u) => ROLE_NAME_MAP[u.role] ?? 'Khác',
          },
          {
            header: 'Trạng thái',
            key: 'isActive',
            width: 16,
            getValue: (u) => (u.isActive ? 'Hoạt động' : 'Đã khóa'),
          },
          {
            header: 'Ngày tạo',
            key: 'createdAt',
            width: 16,
            getValue: (u) => formatDate(u.createdAt),
          },
        ],
        data: allFiltered,
      });
      toast.success('Xuất danh sách người dùng ra Excel thành công.');
    } catch {
      toast.error('Lỗi khi xuất file Excel. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  }, [roleFilter, keyword, toast]);

  return {
    users,
    roleFilter,
    keyword,
    page,
    pageSize,
    setPage,
    setPageSize,
    isLoading,
    targetUser,
    setTargetUser,
    isUpdatingStatus,
    isExporting,
    onRoleChange: handleRoleChange,
    onSearchChange: handleSearchChange,
    onConfirmToggleStatus: handleConfirmToggleStatus,
    onExportExcel: handleExportExcel,
  };
}
