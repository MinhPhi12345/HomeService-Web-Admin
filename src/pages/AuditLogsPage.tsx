import { History } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

export default function AuditLogsPage() {
  return (
    <div className="admin-page">
      <div className="card-box">
        <EmptyState
          icon={<History size={48} />}
          title="Chưa có nhật ký kiểm toán"
          description="Lịch sử các thao tác thay đổi dữ liệu của quản trị viên sẽ được ghi nhận tại đây."
        />
      </div>
    </div>
  );
}
