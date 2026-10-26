interface OrderStatusProgressListProps {
  completed?: number;
  inProgress?: number;
  findingTasker?: number;
  disputed?: number;
  cancelled?: number;
}

export default function OrderStatusProgressList({
  completed = 342,
  inProgress = 24,
  findingTasker = 12,
  disputed = 5,
  cancelled = 26,
}: OrderStatusProgressListProps) {
  const total = completed + inProgress + findingTasker + disputed + cancelled;

  const items = [
    { label: 'Đã hoàn tất', count: completed, color: 'var(--success)' },
    { label: 'Đang thực hiện', count: inProgress, color: 'var(--primary-500)' },
    { label: 'Đang tìm Tasker', count: findingTasker, color: 'var(--accent-500)' },
    { label: 'Đang khiếu nại', count: disputed, color: '#F97316' },
    { label: 'Đã hủy', count: cancelled, color: 'var(--danger)' },
  ];

  return (
    <div className="card order-progress-card">
      <h3 className="chart-title">Trạng thái đơn hàng</h3>
      <div className="order-progress-list">
        {items.map((item, idx) => {
          const percent = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div key={idx} className="order-progress-item">
              <div className="order-progress-labels">
                <span className="order-status-name">{item.label}</span>
                <span className="order-status-count">{item.count}</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.max(percent, 3)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
