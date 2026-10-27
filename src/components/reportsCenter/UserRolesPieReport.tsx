import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { UserRolePieItem } from '../../types/reportsCenter';
import EmptyState from '../common/EmptyState';

interface UserRolesPieReportProps {
  items: UserRolePieItem[];
  onSelect: (item: UserRolePieItem) => void;
}

export default function UserRolesPieReport({ items, onSelect }: UserRolesPieReportProps) {
  if (!items || items.every((i) => i.count === 0)) {
    return <EmptyState title="Chưa có dữ liệu người dùng." />;
  }

  const totalUsers = items.reduce((acc, c) => acc + c.count, 0);
  const handleOpenDetail = (roleItem: UserRolePieItem) => onSelect(roleItem);

  return (
    <div className="report-view-wrapper">
      <div className="report-split-grid">
        <div className="card report-chart-card">
          <h3 className="chart-title">Cơ cấu người dùng theo vai trò (Pie Chart)</h3>
          <p className="chart-subtitle">Nhấn vào từng phần hình tròn để xem danh sách tài khoản</p>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={items}
                  dataKey="count"
                  nameKey="roleName"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={3}
                  cursor="pointer"
                  onClick={(_, idx) => {
                    if (items[idx]) handleOpenDetail(items[idx]);
                  }}
                >
                  {items.map((it, idx) => (
                    <Cell key={idx} fill={it.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} tài khoản (${((Number(val ?? 0) / totalUsers) * 100).toFixed(1)}%)`, String(name)]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, border: '1px solid #D9E3E6' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card report-table-card">
          <h4 className="table-card-title">Bảng phân bố người dùng ({totalUsers} tài khoản)</h4>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 56, textAlign: 'center' }}>STT</th>
                  <th>Vai trò</th>
                  <th style={{ textAlign: 'center' }}>Tổng số</th>
                  <th style={{ textAlign: 'center' }}>Hoạt động</th>
                  <th style={{ textAlign: 'center' }}>Đã khóa</th>
                  <th style={{ textAlign: 'right' }}>Tỉ lệ</th>
                  <th style={{ textAlign: 'center' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} onClick={() => handleOpenDetail(it)} style={{ cursor: 'pointer' }}>
                    <td style={{ textAlign: 'center', color: 'var(--ink-400)' }}>{idx + 1}</td>
                    <td>
                      <div className="legend-cell">
                        <span className="legend-color-dot" style={{ backgroundColor: it.color }} />
                        <span className="font-medium">{it.roleName}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{it.count}</td>
                    <td style={{ textAlign: 'center', color: 'var(--success)' }}>{it.activeCount}</td>
                    <td style={{ textAlign: 'center', color: 'var(--danger)' }}>{it.blockedCount}</td>
                    <td style={{ textAlign: 'right' }}>{it.percentage}%</td>
                    <td style={{ textAlign: 'center' }}>
                      <button type="button" className="btn btn-outline btn-sm">Xem nhóm</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
