import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { logoutApi } from '../../services/authService';
import ConfirmDialog from '../common/ConfirmDialog';

interface HeaderProps {
  onToggleSidebar: () => void;
}

interface PageMeta {
  title: string;
  subtitle: string;
}

const pageMetaMap: Record<string, PageMeta> = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Tháng 10/2026 - Dữ liệu minh họa',
  },
  '/services': {
    title: 'Dịch vụ & bảng giá',
    subtitle: 'Thêm, sửa, xóa nhìn danh mục - giá mới chỉ áp dụng cho đơn tạo sau',
  },
  '/users': {
    title: 'Người dùng',
    subtitle: 'Khóa / mở khóa tài khoản vi phạm',
  },
  '/tasker-verification': {
    title: 'Duyệt hồ sơ Tasker',
    subtitle: '5 hồ sơ đang chờ xét duyệt',
  },
  '/disputes': {
    title: 'Khiếu nại',
    subtitle: 'Danh sách khiếu nại đang chờ xử lý',
  },
  '/flagged-reviews': {
    title: 'Đánh giá bị báo cáo',
    subtitle: '2 đánh giá chờ xử lý',
  },
  '/revenue-report': {
    title: 'Báo cáo doanh thu',
    subtitle: 'Doanh thu, hoa hồng, tiền tạm giữ và hoàn tiền theo khoảng ngày',
  },
  '/audit-logs': {
    title: 'Nhật ký kiểm toán',
    subtitle: 'Lịch sử thao tác quản trị và thay đổi hệ thống',
  },
  '/403': {
    title: 'Lỗi quyền truy cập',
    subtitle: 'Bạn không có quyền thực hiện thao tác này',
  },
};

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const meta = pageMetaMap[location.pathname] ?? {
    title: 'Hệ thống quản trị',
    subtitle: 'HomeService Admin Portal',
  };

  const initialLetter = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A';

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
          <div className="header-title-group">
            <h1 className="header-page-title">{meta.title}</h1>
            <p className="header-page-subtitle">{meta.subtitle}</p>
          </div>
        </div>

        <div className="header-right">
          <button
            type="button"
            className="header-icon-btn"
            title="Thông báo"
            aria-label="Thông báo"
          >
            <Bell size={18} />
          </button>

          <div
            className="header-user-badge"
            onClick={() => setIsConfirmOpen(true)}
            role="button"
            tabIndex={0}
            title="Đăng xuất"
          >
            <div className="header-avatar-circle">{initialLetter}</div>
            <span className="header-role-text">Admin</span>
            <LogOut size={14} className="header-logout-icon" />
          </div>
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
