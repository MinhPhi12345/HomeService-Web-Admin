import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = 'Đã xảy ra lỗi',
  message,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`error-state ${className}`.trim()}>
      <div className="error-state-header">
        <AlertCircle size={20} className="error-state-icon" />
        <h4 className="error-state-title">{title}</h4>
      </div>
      {message && <p className="error-state-message">{message}</p>}
      {onRetry && (
        <div className="error-state-action">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<RefreshCw size={14} />}
            onClick={onRetry}
          >
            Thử lại
          </Button>
        </div>
      )}
    </div>
  );
}
