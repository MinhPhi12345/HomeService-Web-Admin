import { useAuth } from '../context/useAuth';
import { useUserManagement } from '../hooks/useUserManagement';
import ConfirmDialog from '../components/common/ConfirmDialog';
import UserFilterTabs from '../components/users/UserFilterTabs';
import UserTable from '../components/users/UserTable';

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
    targetUser,
    setTargetUser,
    isUpdatingStatus,
    isExporting,
    onRoleChange,
    onSearchChange,
    onConfirmToggleStatus,
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
        onToggleStatus={(u) => setTargetUser(u)}
      />

      <div className="admin-notice-box">
        <span>
          ⓘ Tài khoản bị khóa không đăng nhập được; Admin không thể tự khóa chính mình. Khách nợ quá 7 ngày có thể bị khóa.
        </span>
      </div>

      <ConfirmDialog
        isOpen={Boolean(targetUser)}
        title={targetUser?.isActive ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
        message={
          targetUser?.isActive
            ? `Bạn có chắc chắn muốn khóa tài khoản "${targetUser.fullName}"? Người dùng này sẽ không thể đăng nhập vào hệ thống.`
            : `Bạn có chắc chắn muốn mở khóa tài khoản "${targetUser?.fullName}"?`
        }
        confirmText={targetUser?.isActive ? 'Khóa' : 'Mở khóa'}
        cancelText="Hủy"
        confirmVariant={targetUser?.isActive ? 'danger' : 'primary'}
        isLoading={isUpdatingStatus}
        onConfirm={onConfirmToggleStatus}
        onCancel={() => setTargetUser(null)}
      />
    </div>
  );
}
