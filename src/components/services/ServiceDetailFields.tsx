import type { ServiceFormErrors } from './serviceValidation';

/** SRS v1.8 – cấu hình số lượng / thời lượng / hạng mục và chi tiết dịch vụ hiện cho khách. */
export interface ServiceDetailState {
  minQuantity: string;
  maxQuantity: string;
  quantityLabel: string;
  quantityHint: string;
  minutesPerUnit: string;
  requiresItemList: boolean;
  includes: string;
  excludes: string;
  customerPrepares: string;
  notes: string;
}

interface ServiceDetailFieldsProps {
  unit: string;
  value: ServiceDetailState;
  onChange: (patch: Partial<ServiceDetailState>) => void;
  errors: ServiceFormErrors;
  isSubmitting: boolean;
}

const DETAIL_FIELDS: { key: keyof ServiceDetailState; label: string; placeholder: string }[] = [
  { key: 'includes', label: 'Công việc bao gồm', placeholder: 'Quét, hút bụi và lau sàn các phòng\nVệ sinh bếp: mặt bếp, bồn rửa' },
  { key: 'excludes', label: 'Không bao gồm', placeholder: 'Giặt ủi quần áo, nấu ăn (đặt dịch vụ riêng)' },
  { key: 'customerPrepares', label: 'Khách cần chuẩn bị', placeholder: 'Chổi, cây lau nhà, nước lau sàn' },
  { key: 'notes', label: 'Lưu ý', placeholder: 'Nhà trên 105 m² nên đặt 2 đơn vào các buổi khác nhau' },
];

function durationText(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} giờ${m ? ` ${m} phút` : ''}` : `${m} phút`;
}

export default function ServiceDetailFields({ unit, value, onChange, errors, isSubmitting }: ServiceDetailFieldsProps) {
  const min = Number(value.minQuantity);
  const max = Number(value.maxQuantity);
  const per = Number(value.minutesPerUnit);
  const fixed = Number.isInteger(min) && min === max;

  return (
    <>
      <div className="service-form-section">
        <h4 className="service-form-section-title">Số lượng & thời lượng mỗi đơn</h4>
        <div className="service-qty-grid">
          <div className="form-group">
            <label htmlFor="svc-min" className="form-label">Tối thiểu ({unit})</label>
            <input
              id="svc-min"
              type="number"
              min={1}
              max={50}
              className={`form-input ${errors.quantity ? 'input-error' : ''}`}
              value={value.minQuantity}
              onChange={(e) => onChange({ minQuantity: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="svc-max" className="form-label">Tối đa ({unit})</label>
            <input
              id="svc-max"
              type="number"
              min={1}
              max={50}
              className={`form-input ${errors.quantity ? 'input-error' : ''}`}
              value={value.maxQuantity}
              onChange={(e) => onChange({ maxQuantity: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="svc-minutes" className="form-label">Phút / {unit}</label>
            <input
              id="svc-minutes"
              type="number"
              min={10}
              max={720}
              step={5}
              className={`form-input ${errors.minutes ? 'input-error' : ''}`}
              value={value.minutesPerUnit}
              onChange={(e) => onChange({ minutesPerUnit: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
        </div>
        {errors.quantity && <span className="form-error">{errors.quantity}</span>}
        {errors.minutes && <span className="form-error">{errors.minutes}</span>}
        <small className="field-hint">
          {fixed
            ? `Khách chỉ đặt ${min} ${unit} mỗi đơn (ô số lượng được ẩn).`
            : `Khách chọn từ ${value.minQuantity || '?'} đến ${value.maxQuantity || '?'} ${unit}.`}{' '}
          Thời lượng ước tính tối đa {durationText(per * (Number.isFinite(max) ? max : 0))} – dùng để xếp lịch Tasker (cộng 30 phút di chuyển).
        </small>

        {!fixed && (
          <>
            <div className="form-group">
              <label htmlFor="svc-qlabel" className="form-label">Nhãn ô số lượng</label>
              <input
                id="svc-qlabel"
                type="text"
                maxLength={50}
                className="form-input"
                placeholder="VD: Số giờ làm, Số hạng mục cần sửa, Số mẻ giặt"
                value={value.quantityLabel}
                onChange={(e) => onChange({ quantityLabel: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="svc-qhint" className="form-label">Gợi ý cho khách</label>
              <input
                id="svc-qhint"
                type="text"
                maxLength={200}
                className="form-input"
                placeholder="VD: 1 mẻ ≈ 7 kg ≈ 15–20 bộ quần áo"
                value={value.quantityHint}
                onChange={(e) => onChange({ quantityHint: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </>
        )}

        <label className="service-check">
          <input
            type="checkbox"
            checked={value.requiresItemList}
            onChange={(e) => onChange({ requiresItemList: e.target.checked })}
            disabled={isSubmitting}
          />
          <span>
            <b>Yêu cầu liệt kê hạng mục & chụp ảnh theo từng hạng mục</b>
            <small>Khách ghi từng hạng mục khi đặt (số dòng = số lượng); Tasker chụp 1–3 ảnh trước/sau cho mỗi hạng mục.</small>
          </span>
        </label>
      </div>

      <div className="service-form-section">
        <h4 className="service-form-section-title">Chi tiết dịch vụ (hiện khi khách bấm ⓘ)</h4>
        <small className="field-hint">Mỗi dòng là một ý, tối đa 1000 ký tự mỗi mục.</small>
        {DETAIL_FIELDS.map((f) => (
          <div className="form-group" key={f.key}>
            <label htmlFor={`svc-${f.key}`} className="form-label">{f.label}</label>
            <textarea
              id={`svc-${f.key}`}
              rows={3}
              maxLength={1000}
              className="form-input form-textarea"
              placeholder={f.placeholder}
              value={value[f.key] as string}
              onChange={(e) => onChange({ [f.key]: e.target.value } as Partial<ServiceDetailState>)}
              disabled={isSubmitting}
            />
          </div>
        ))}
      </div>
    </>
  );
}
