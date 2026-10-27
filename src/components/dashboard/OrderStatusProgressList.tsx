interface StatusGroup {
  key: string;
  label: string;
  color: string;
  count: number;
}

interface OrderStatusProgressListProps {
  groups: StatusGroup[];
  total: number;
}

export default function OrderStatusProgressList({ groups, total }: OrderStatusProgressListProps) {
  return (
    <div className="card order-progress-card">
      <h3 className="chart-title">Trạng thái đơn hàng ({total.toLocaleString('vi-VN')} đơn)</h3>
      <div className="order-progress-list">
        {groups.map((item) => {
          const percent = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div key={item.key} className="order-progress-item">
              <div className="order-progress-labels">
                <span className="order-status-name">
                  <span className="legend-color-dot" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
                <span className="order-status-count">
                  {item.count} <small>({percent.toFixed(0)}%)</small>
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${item.count > 0 ? Math.max(percent, 3) : 0}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
