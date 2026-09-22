import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SideNav() {
  const { user, logout } = useAuth();

  return (
    <aside style={{ width: 220, borderRight: "1px solid #ddd", padding: 16 }}>
      <h3>HomeService Admin</h3>
      <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Link to="/">Tổng quan</Link>
        <Link to="/services">Dịch vụ</Link>
        <Link to="/users">Người dùng</Link>
        <Link to="/tasker-verification">Duyệt hồ sơ Tasker</Link>
      </nav>
      {user && (
        <div style={{ marginTop: 24 }}>
          <p>{user.fullName}</p>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      )}
    </aside>
  );
}
