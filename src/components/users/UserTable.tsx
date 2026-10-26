import type { AdminUserItem } from '../../types';
import { UserRole } from '../../types';
import { formatDate } from '../../utils/formatters';
import Badge, { type BadgeVariant } from '../common/Badge';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import TableSkeleton from '../common/TableSkeleton';

interface UserTableProps {
  users: AdminUserItem[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  currentAdminId?: number;
  isLoading: boolean;
  onToggleStatus: (user: AdminUserItem) => void;
}

const roleBadgeMeta: Record<number, { label: string; variant: BadgeVariant }> = {
  [UserRole.Customer]: { label: 'Khách hàng', variant: 'sky' },
  [UserRole.Tasker]: { label: 'Tasker', variant: 'lilac' },
  [UserRole.Admin]: { label: 'Admin', variant: 'peach' },
};

export default function UserTable({
  users,
  totalRecords,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  currentAdminId,
  isLoading,
  onToggleStatus,
}: UserTableProps) {
  const totalPages = Math.ceil(totalRecords / pageSize);
  const pagedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (isLoading) {
    return (
      <div className="card">
        <TableSkeleton rows={6} columns={8} />
      </div>
    );
  }

  if (totalRecords === 0) {
    return (
      <div className="card">
        <EmptyState title="Không tìm thấy người dùng nào phù hợp" />
      </div>
    );
  }

  return (
    <div className="card user-table-card">
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 60, textAlign: 'center' }}>STT</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {pagedUsers.map((u, idx) => {
              const stt = (currentPage - 1) * pageSize + idx + 1;
              const isSelf = currentAdminId !== undefined && u.id === currentAdminId;
              const roleMeta = roleBadgeMeta[u.role] ?? {
                label: 'Khác',
                variant: 'neutral',
              };

              return (
                <tr key={u.id}>
                  <td style={{ textAlign: 'center', color: 'var(--ink-400)' }}>{stt}</td>
                  <td className="font-medium">{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.phoneNumber ?? '—'}</td>
                  <td>
                    <Badge variant={roleMeta.variant}>{roleMeta.label}</Badge>
                  </td>
                  <td>
                    <Badge variant={u.isActive ? 'mint' : 'rose'}>
                      {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </Badge>
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td style={{ textAlign: 'center' }}>
                    {isSelf ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <button
                        type="button"
                        className={`btn-action-pill ${u.isActive ? 'btn-lock' : 'btn-unlock'}`}
                        onClick={() => onToggleStatus(u)}
                      >
                        {u.isActive ? 'Khóa' : 'Mở khóa'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
