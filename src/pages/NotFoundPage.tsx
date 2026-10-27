import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="error-page-container">
      <div className="error-page-card">
        <div className="error-page-icon-wrapper neutral">
          <FileQuestion size={48} />
        </div>
        <h1 className="error-page-title">404 - Không tìm thấy trang</h1>
        <p className="error-page-description">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>
        <div className="error-page-actions">
          <Button
            type="button"
            variant="primary"
            icon={<Home size={16} />}
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
