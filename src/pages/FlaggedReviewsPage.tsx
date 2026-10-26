import { Flag } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

export default function FlaggedReviewsPage() {
  return (
    <div className="card page-card">
      <EmptyState
        icon={<Flag size={40} />}
        title="Chưa có đánh giá nào bị báo cáo"
        description="Danh sách đánh giá bị báo cáo sai sự thật hoặc vi phạm tiêu chuẩn sẽ xuất hiện tại đây."
      />
    </div>
  );
}
