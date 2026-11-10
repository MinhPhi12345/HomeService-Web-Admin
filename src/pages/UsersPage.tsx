import { useAuth } from '../context/useAuth';
import { useUserManagement } from '../hooks/useUserManagement';
import UserFilterTabs from '../components/users/UserFilterTabs';
import UserTable from '../components/users/UserTable';
import LockUserDialog from '../components/users/LockUserDialog';
import UnlockUserDialog from '../components/users/UnlockUserDialog';

export default function UsersPage() {
  const { user: currentAdmin } = useAuth();
  const {
    users,
    roleFilter,
    keyword,
    page,
    pageSize,
    setPage,
    setPageSize,
    isLoading,
    lockTarget,
    setLockTarget,
    unlockTarget,
    setUnlockTarget,
    isUpdatingStatus,
    isExporting,
    onRoleChange,
    onSearchChange,
    onConfirmLock,
    onConfirmUnlock,
    onExportExcel,
  } = useUserManagement();

  return (
    <div className="admin-page">
      <UserFilterTabs
        currentRole={roleFilter}
        onRoleChange={onRoleChange}
        keyword={keyword}
        onSearchChange={onSearchChange}
        onExportExcel={onExportExcel}
        isExporting={isExporting}
        totalRecords={users.length}
      />

      <UserTable
        users={users}
        totalRecords={users.length}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        currentAdminId={currentAdmin?.userId}
        isLoading={isLoading}
        onLock={(u) => setLockTarget(u)}
        onUnlock={(u) => setUnlockTarget(u)}
      />

      <div className="admin-notice-box">
        <span>
          ⓘ Khóa tài khoản phải ghi lý do và người dùng nhận email kèm đường dẫn gửi yêu cầu mở khóa. Người dùng còn đơn đang dở
          sẽ được khóa sau khi hoàn tất đơn (hoặc chọn khóa ngay). Admin không thể tự khóa chính mình.
        </span>
      </div>

      <LockUserDialog
        user={lockTarget}
        isSubmitting={isUpdatingStatus}
        onConfirm={onConfirmLock}
        onCancel={() => setLockTarget(null)}
      />
      <UnlockUserDialog
        user={unlockTarget}
        isSubmitting={isUpdatingStatus}
        onConfirm={onConfirmUnlock}
        onCancel={() => setUnlockTarget(null)}
      />
    </div>
  );
}
