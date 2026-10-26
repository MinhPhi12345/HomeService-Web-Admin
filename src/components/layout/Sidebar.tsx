import { NavLink } from 'react-router-dom';
import {
  AlertTriangle,
  Flag,
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

const navItems = [
  { to: '/', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
  { to: '/services', label: 'Danh mục dịch vụ', icon: <Layers size={20} /> },
  { to: '/users', label: 'Người dùng', icon: <Users size={20} /> },
  {
    to: '/tasker-verification',
    label: 'Duyệt Tasker',
    icon: <UserCheck size={20} />,
  },
  { to: '/disputes', label: 'Khiếu nại', icon: <AlertTriangle size={20} /> },
  {
    to: '/flagged-reviews',
    label: 'Đánh giá bị báo cáo',
    icon: <Flag size={20} />,
  },
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
              <span className="sidebar-brand-subtitle">Admin</span>
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
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
