interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({
  rows = 5,
  columns = 6,
}: TableSkeletonProps) {
  return (
    <div className="table-skeleton-wrapper" aria-label="Đang tải dữ liệu">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="table-skeleton-row">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <div key={cIdx} className="skeleton-cell" />
          ))}
        </div>
      ))}
    </div>
  );
}
