import { useState, useRef, type ChangeEvent } from 'react';
import { Upload, X, Loader2, ImageOff } from 'lucide-react';
import { getImageUrl } from '../../utils/formatters';
import { uploadImage } from '../../services/uploadService';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Ảnh dịch vụ',
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setImageError(false);

    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type.toLowerCase())) {
      setErrorMessage('Chỉ hỗ trợ ảnh định dạng JPG hoặc PNG.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Dung lượng ảnh tối đa 5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setUploading(true);
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Tải ảnh lên thất bại. Vui lòng thử lại.',
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const resolvedUrl = value ? getImageUrl(value) : '';

  return (
    <div className="image-upload-container">
      {label && <label className="form-label">{label}</label>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />

      <div className="image-upload-box">
        {resolvedUrl && !imageError ? (
          <div className="image-preview-wrapper">
            <img
              src={resolvedUrl}
              alt="Xem trước"
              className="image-preview"
              onError={() => setImageError(true)}
            />
            {!disabled && (
              <button
                type="button"
                className="image-remove-btn"
                title="Xóa ảnh"
                onClick={() => {
                  onChange('');
                  setImageError(false);
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          <div
            className="image-placeholder-box"
            onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : imageError ? (
              <div className="image-error-state">
                <ImageOff size={24} />
                <span>Không tải được ảnh</span>
              </div>
            ) : (
              <div className="image-empty-state">
                <Upload size={24} />
                <span>Tải ảnh JPG / PNG (≤ 5MB)</span>
              </div>
            )}
          </div>
        )}

        {resolvedUrl && !disabled && (
          <button
            type="button"
            className="btn btn-outline btn-sm image-change-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Đang tải...' : 'Đổi ảnh'}
          </button>
        )}
      </div>

      {errorMessage && <span className="field-error">{errorMessage}</span>}
    </div>
  );
}
