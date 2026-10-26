import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = 24,
  className = '',
  label,
}: LoadingSpinnerProps) {
  return (
    <div className={`loading-spinner-wrapper ${className}`.trim()}>
      <Loader2 size={size} className="spinner" />
      {label && <span className="loading-spinner-label">{label}</span>}
    </div>
  );
}

interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export function LoadingSkeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div
      className={`loading-skeleton ${className}`.trim()}
      style={{ width, height, borderRadius }}
    />
  );
}

export default LoadingSpinner;
