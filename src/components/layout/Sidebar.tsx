import { NavLink } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  PieChart,
  ClipboardList,
  Flame,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemDef {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItemDef[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/services', label: 'Dịch vụ & bảng giá', icon: <Layers size={18} /> },
  { to: '/users', label: 'Người dùng', icon: <Users size={18} /> },
  { to: '/tasker-verification', label: 'Duyệt Tasker', icon: <UserCheck size={18} />, badge: 5 },
  { to: '/disputes', label: 'Khiếu nại', icon: <AlertTriangle size={18} />, badge: 2 },
  { to: '/flagged-reviews', label: 'Đánh giá báo cáo', icon: <Flame size={18} />, badge: 2 },
  { to: '/revenue-report', label: 'Báo cáo doanh thu', icon: <BarChart3 size={18} /> },
  { to: '/audit-logs', label: 'Nhật ký kiểm toán', icon: <ClipboardList size={18} /> },
  { to: '/reports', label: 'Trung tâm báo cáo', icon: <PieChart size={18} /> },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <ShieldCheck size={24} />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-title">HomeService</span>
              <span className="sidebar-brand-subtitle">Quản trị viên</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="sidebar-nav-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
