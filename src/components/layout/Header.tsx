import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, Flame, LogOut, Menu, UserCheck } from 'lucide-react';
import { useAdminCounters } from '../../context/useAdminCounters';
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

type Counts = ReturnType<typeof useAdminCounters>['counts'];

function buildPageMeta(path: string, counts: Counts, loaded: boolean): PageMeta {
  const n = (value: number, unit: string, none: string) => (!loaded ? 'Đang tải số liệu…' : value > 0 ? `${value} ${unit}` : none);
  const map: Record<string, PageMeta> = {
    '/': { title: 'Dashboard', subtitle: 'Tổng quan hoạt động hệ thống theo dữ liệu thực tế' },
    '/services': { title: 'Dịch vụ & bảng giá', subtitle: 'Thêm, sửa, ngừng / khôi phục dịch vụ – giá mới chỉ áp dụng cho đơn tạo sau' },
    '/users': { title: 'Người dùng', subtitle: 'Tra cứu, phân quyền theo vai trò, khóa / mở khóa tài khoản vi phạm' },
    '/tasker-verification': {
      title: 'Duyệt hồ sơ Tasker',
      subtitle: n(counts.pendingTaskers, 'hồ sơ đang chờ xét duyệt', 'Không có hồ sơ nào đang chờ duyệt'),
    },
    '/disputes': {
      title: 'Khiếu nại',
      subtitle: n(counts.openDisputes, 'khiếu nại đang chờ xử lý', 'Không có khiếu nại nào đang chờ xử lý'),
    },
    '/flagged-reviews': {
      title: 'Đánh giá bị báo cáo',
      subtitle: n(counts.flaggedReviews, 'đánh giá chờ kiểm duyệt', 'Không có đánh giá nào bị báo cáo'),
    },
    '/revenue-report': { title: 'Báo cáo doanh thu', subtitle: 'Doanh thu, hoa hồng, tiền tạm giữ và hoàn tiền theo khoảng ngày' },
    '/audit-logs': { title: 'Nhật ký kiểm toán', subtitle: 'Lịch sử giao dịch tiền và quyết định khiếu nại (chỉ đọc)' },
    '/reports': { title: 'Trung tâm báo cáo', subtitle: 'Biểu đồ tròn, biểu đồ cột – nhấn vào biểu đồ để xem chi tiết' },
    '/403': { title: 'Lỗi quyền truy cập', subtitle: 'Bạn không có quyền thực hiện thao tác này' },
  };
  return map[path] ?? { title: 'Hệ thống quản trị', subtitle: 'HomeService Admin Portal' };
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { counts, loaded } = useAdminCounters();
  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const meta = buildPageMeta(location.pathname, counts, loaded);
  const totalTodo = counts.pendingTaskers + counts.openDisputes + counts.flaggedReviews;

  const nameParts = (user?.fullName ?? 'Admin').trim().split(/\s+/);
  // Chữ viết tắt: chữ đầu của từ đầu + từ cuối ("Quản trị viên" → QV, "Đặng Hoàng Minh Phi" → ĐP)
  const initialLetter = (
    nameParts.length > 1 ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}` : nameParts[0].charAt(0)
  ).toUpperCase();
  const displayName = user?.fullName?.trim() || 'Quản trị viên';

  useEffect(() => {
    if (!isBellOpen) return;
    const close = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setIsBellOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isBellOpen]);

  const todoItems = [
    { to: '/tasker-verification', label: 'Hồ sơ Tasker chờ duyệt', count: counts.pendingTaskers, icon: <UserCheck size={16} /> },
    { to: '/disputes', label: 'Khiếu nại chờ xử lý', count: counts.openDisputes, icon: <AlertTriangle size={16} /> },
    { to: '/flagged-reviews', label: 'Đánh giá bị báo cáo', count: counts.flaggedReviews, icon: <Flame size={16} /> },
  ];

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
          <div className="header-bell-wrap" ref={bellRef}>
            <button
              type="button"
              className="header-icon-btn"
              title="Việc cần xử lý"
              aria-label="Việc cần xử lý"
              aria-expanded={isBellOpen}
              onClick={() => setIsBellOpen((v) => !v)}
            >
              <Bell size={18} />
              {totalTodo > 0 && <span className="header-bell-dot">{totalTodo > 99 ? '99+' : totalTodo}</span>}
            </button>
            {isBellOpen && (
              <div className="header-bell-menu" role="menu">
                <div className="header-bell-title">Việc cần xử lý</div>
                {todoItems.map((it) => (
                  <button
                    key={it.to}
                    type="button"
                    className="header-bell-item"
                    onClick={() => {
                      setIsBellOpen(false);
                      navigate(it.to);
                    }}
                  >
                    <span className="header-bell-icon">{it.icon}</span>
                    <span className="header-bell-label">{it.label}</span>
                    <span className={`header-bell-count ${it.count > 0 ? 'has' : ''}`}>{it.count}</span>
                  </button>
                ))}
                {totalTodo === 0 && <p className="header-bell-empty">Mọi việc đã được xử lý xong 🎉</p>}
              </div>
            )}
          </div>

          <div
            className="header-user-badge"
            onClick={() => setIsConfirmOpen(true)}
            role="button"
            tabIndex={0}
            title="Đăng xuất"
          >
            <div className="header-avatar-circle">{initialLetter}</div>
            <span className="header-user-info">
              <span className="header-user-name" title={displayName}>{displayName}</span>
              <span className="header-user-role">Admin</span>
            </span>
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
