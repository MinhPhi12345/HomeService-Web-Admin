import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, User } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { USER_ROLE_LABELS } from '../../utils/constants';
import { logoutApi } from '../../services/authService';
import ConfirmDialog from '../common/ConfirmDialog';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const pageTitles: Record<string, string> = {
  '/': 'Tổng quan',
  '/services': 'Danh mục dịch vụ',
  '/users': 'Người dùng',
  '/tasker-verification': 'Duyệt Tasker',
  '/disputes': 'Khiếu nại',
  '/flagged-reviews': 'Đánh giá bị báo cáo',
  '/403': 'Lỗi quyền truy cập',
};

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const currentTitle = pageTitles[location.pathname] ?? 'Hệ thống quản trị';
  const roleLabel = user ? USER_ROLE_LABELS[user.role] : '';

  async function handleConfirmLogout() {
    setIsLoggingOut(true);
    try {
      await logoutApi();
    } catch {
    } finally {
      setIsLoggingOut(false);
      setIsConfirmOpen(false);
      logout();
      navigate('/login');
    }
  }

  return (
    <>
      <header className="admin-header">
        <div className="header-left">
          <button
            type="button"
            className="header-menu-btn"
            onClick={onToggleSidebar}
            aria-label="Mở menu điều hướng"
          >
            <Menu size={20} />
          </button>
          <h1 className="header-page-title">{currentTitle}</h1>
        </div>

        <div className="header-right">
          {user && (
            <div className="header-user-info">
              <div className="header-user-avatar">
                <User size={16} />
              </div>
              <div className="header-user-details">
                <span className="header-user-name">{user.fullName}</span>
                <span className="header-user-role">{roleLabel}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            className="header-logout-btn"
            onClick={() => setIsConfirmOpen(true)}
            title="Đăng xuất"
          >
            <LogOut size={16} />
            <span className="logout-btn-text">Đăng xuất</span>
          </button>
        </div>
      </header>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn kết thúc phiên làm việc?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        confirmVariant="danger"
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
