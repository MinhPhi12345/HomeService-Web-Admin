import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title = 'Chưa có dữ liệu',
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      <div className="empty-state-icon">
        {icon ?? <Inbox size={40} />}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
