import { Edit3, RotateCcw, Trash2, Wrench } from 'lucide-react';
import type { ServiceCategoryResponse } from '../../types';
import { formatVnd, getImageUrl } from '../../utils/formatters';
import Badge from '../common/Badge';

interface ServiceTableRowProps {
  item: ServiceCategoryResponse;
  stt: number;
  isSelected: boolean;
  onEdit: (item: ServiceCategoryResponse) => void;
  onDelete: (item: ServiceCategoryResponse) => void;
  onRestore: (item: ServiceCategoryResponse) => void;
}

export default function ServiceTableRow({
  item,
  stt,
  isSelected,
  onEdit,
  onDelete,
  onRestore,
}: ServiceTableRowProps) {
  const iconSrc = item.iconUrl ? getImageUrl(item.iconUrl) : '';

  return (
    <tr className={`${isSelected ? 'row-selected' : ''} ${item.isActive ? '' : 'row-inactive'}`}>
      <td style={{ textAlign: 'center', color: 'var(--ink-400)' }}>{stt}</td>
      <td className="font-medium">
        <div className="service-name-cell">
          {iconSrc ? (
            <img src={iconSrc} alt="" className="service-mini-icon" />
          ) : (
            <div className="service-mini-icon-placeholder">
              <Wrench size={14} />
            </div>
          )}
          <span>{item.name}</span>
        </div>
      </td>
      <td className="text-primary font-medium">{formatVnd(item.basePrice)}</td>
      <td>{item.unit}</td>
      <td>
        <Badge variant={item.isActive ? 'mint' : 'rose'}>
          {item.isActive ? 'Đang hoạt động' : 'Đã ẩn'}
        </Badge>
      </td>
      <td className="text-right">
        <div className="table-actions">
          <button
            type="button"
            className="action-btn edit-btn"
            title="Sửa"
            onClick={() => onEdit(item)}
          >
            <Edit3 size={15} />
          </button>
          {item.isActive ? (
            <button
              type="button"
              className="action-btn delete-btn"
              title="Xóa (ẩn dịch vụ)"
              onClick={() => onDelete(item)}
            >
              <Trash2 size={15} />
            </button>
          ) : (
            <button
              type="button"
              className="action-btn restore-btn"
              title="Khôi phục dịch vụ"
              onClick={() => onRestore(item)}
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
