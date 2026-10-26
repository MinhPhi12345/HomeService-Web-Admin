import { AlertTriangle } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

export default function DisputesPage() {
  return (
    <div className="card page-card">
      <EmptyState
        icon={<AlertTriangle size={40} />}
        title="Chưa có khiếu nại nào cần xử lý"
        description="Danh sách tranh chấp và khiếu nại dịch vụ sẽ được hiển thị tại đây khi có phát sinh."
      />
    </div>
  );
}
