import {
  SERVICE_UNITS,
} from '../../utils/constants';
import type { ServiceFormErrors } from './serviceValidation';
import ImageUpload from '../common/ImageUpload';

interface ServiceFormFieldsProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  basePrice: string;
  setBasePrice: (v: string) => void;
  unit: string;
  setUnit: (v: string) => void;
  iconUrl: string;
  setIconUrl: (v: string) => void;
  errors: ServiceFormErrors;
  setErrors: React.Dispatch<React.SetStateAction<ServiceFormErrors>>;
  isSubmitting: boolean;
}

export default function ServiceFormFields({
  name,
  setName,
  description,
  setDescription,
  basePrice,
  setBasePrice,
  unit,
  setUnit,
  iconUrl,
  setIconUrl,
  errors,
  setErrors,
  isSubmitting,
}: ServiceFormFieldsProps) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="service-name" className="form-label">
          Tên dịch vụ (2-100 ký tự) <span className="required-star">*</span>
        </label>
        <input
          id="service-name"
          type="text"
          className={`form-input ${errors.name ? 'input-error' : ''}`}
          placeholder="Nhập tên dịch vụ..."
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          disabled={isSubmitting}
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="service-desc" className="form-label">
          Mô tả (≤ 1000 ký tự)
        </label>
        <textarea
          id="service-desc"
          rows={3}
          className="form-input form-textarea"
          placeholder="Quét, lau sàn, lau bụi, vệ sinh bếp và nhà tắm..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="service-price" className="form-label">
          Giá cơ bản (VND) <span className="required-star">*</span>
        </label>
        <input
          id="service-price"
          type="number"
          min={1}
          step={1}
          className={`form-input ${errors.price ? 'input-error' : ''}`}
          placeholder="150000"
          value={basePrice}
          onChange={(e) => {
            setBasePrice(e.target.value);
            if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
          }}
          disabled={isSubmitting}
        />
        {errors.price && <span className="form-error">{errors.price}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">
          Đơn vị tính <span className="required-star">*</span>
        </label>
        <div className="unit-chip-group">
          {SERVICE_UNITS.map((u) => (
            <button
              key={u}
              type="button"
              className={`unit-chip ${unit === u ? 'active' : ''}`}
              onClick={() => {
                setUnit(u);
                if (errors.unit) setErrors((prev) => ({ ...prev, unit: undefined }));
              }}
              disabled={isSubmitting}
            >
              {u}
            </button>
          ))}
        </div>
        {errors.unit && <span className="form-error">{errors.unit}</span>}
      </div>

      <div className="form-group">
        <ImageUpload
          value={iconUrl}
          onChange={(url) => setIconUrl(url)}
          label="Link icon / Tải ảnh"
          disabled={isSubmitting}
        />
      </div>

      <div className="admin-notice-box" style={{ marginTop: '8px' }}>
        <span>
          ⓘ Đổi giá chỉ áp dụng cho đơn mới. Khách nào nợ, đơn cũ vẫn giữ tham chiếu.
        </span>
      </div>
    </>
  );
}
