import { Link } from 'react-router-dom';
import type { AdminUserItem } from '../../types';
import { LOCK_REASON_LABELS, UserRole } from '../../types';
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
  onLock: (user: AdminUserItem) => void;
  onUnlock: (user: AdminUserItem) => void;
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
  onLock,
  onUnlock,
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
                    <div className="user-status-cell">
                      <Badge variant={!u.isActive ? 'rose' : u.lockPendingAt ? 'peach' : 'mint'}>
                        {!u.isActive ? 'Đã khóa' : u.lockPendingAt ? 'Chờ khóa' : 'Hoạt động'}
                      </Badge>
                      {(u.lockPendingAt || !u.isActive) && u.lockReason != null && (
                        <span className="user-lock-reason" title={u.lockDetail ?? ''}>
                          {LOCK_REASON_LABELS[u.lockReason]}
                          {u.lockDetail ? `: ${u.lockDetail}` : ''}
                        </span>
                      )}
                      {(u.pendingAppeals ?? 0) > 0 && (
                        <Link to="/account-appeals" className="appeal-chip">
                          Có yêu cầu mở khóa
                        </Link>
                      )}
                    </div>
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td style={{ textAlign: 'center' }}>
                    {isSelf ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <button
                        type="button"
                        className={`btn-action-pill ${u.isActive && !u.lockPendingAt ? 'btn-lock' : 'btn-unlock'}`}
                        onClick={() => (u.isActive && !u.lockPendingAt ? onLock(u) : onUnlock(u))}
                      >
                        {!u.isActive ? 'Mở khóa' : u.lockPendingAt ? 'Hủy chờ khóa' : 'Khóa'}
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
