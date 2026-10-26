import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { ReportDetailPayload, UserRolePieItem } from '../../types/reportsCenter';
import EmptyState from '../common/EmptyState';

interface UserRolesPieReportProps {
  items: UserRolePieItem[];
  onSelectDetail: (payload: ReportDetailPayload) => void;
}

export default function UserRolesPieReport({ items, onSelectDetail }: UserRolesPieReportProps) {
  if (!items || items.length === 0) {
    return <EmptyState title="Chưa có dữ liệu người dùng." />;
  }

  const totalUsers = items.reduce((acc, c) => acc + c.count, 0);

  const handleOpenDetail = (roleItem: UserRolePieItem) => {
    onSelectDetail({
      reportKey: 'user-roles',
      title: `Chi tiết nhóm người dùng: ${roleItem.roleName}`,
      subtitle: `Tổng cộng ${roleItem.count} tài khoản (${roleItem.activeCount} hoạt động, ${roleItem.blockedCount} đã khóa)`,
      summaryStats: [
        { label: 'Vai trò', value: roleItem.roleName },
        { label: 'Tổng tài khoản', value: `${roleItem.count} người` },
        { label: 'Đang hoạt động', value: `${roleItem.activeCount} người` },
        { label: 'Đã bị khóa', value: `${roleItem.blockedCount} người` },
      ],
      columns: [
        { header: 'Họ tên', key: 'fullName' },
        { header: 'Email', key: 'email' },
        { header: 'Số điện thoại', key: 'phone' },
        { header: 'Trạng thái', key: 'statusText' },
        { header: 'Ngày tham gia', key: 'joinDate' },
      ],
      rows: [
        { fullName: 'Trần Văn Nam', email: 'nam.tran@example.com', phone: '0901234567', statusText: 'Đang hoạt động', joinDate: '01/10/2026' },
        { fullName: 'Lê Thị Thu', email: 'thu.le@example.com', phone: '0912345678', statusText: 'Đang hoạt động', joinDate: '05/10/2026' },
        { fullName: 'Nguyễn Quốc Tuấn', email: 'tuan.nguyen@example.com', phone: '0987654321', statusText: 'Đang hoạt động', joinDate: '12/10/2026' },
        { fullName: 'Phạm Hồng Ánh', email: 'anh.pham@example.com', phone: '0933456789', statusText: 'Đã khóa', joinDate: '15/10/2026' },
      ],
      isLimitedApiNotice: import.meta.env.VITE_USE_MOCK !== 'true',
    });
  };

  return (
    <div className="report-view-wrapper">
      <div className="report-split-grid">
        <div className="card report-chart-card">
          <h3 className="chart-title">Cơ cấu người dùng theo vai trò (Pie Chart)</h3>
          <p className="chart-subtitle">Nhấp vào từng phần hình tròn để xem danh sách tài khoản chi tiết</p>

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
                  formatter={(val: any, name: any) => [`${val} tài khoản (${((Number(val ?? 0) / totalUsers) * 100).toFixed(1)}%)`, String(name)]}
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
