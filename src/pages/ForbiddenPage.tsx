import { useNavigate } from 'react-router-dom';
import { Home, ShieldAlert } from 'lucide-react';
import Button from '../components/common/Button';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="error-page-container">
      <div className="error-page-card">
        <div className="error-page-icon-wrapper danger">
          <ShieldAlert size={48} />
        </div>
        <h1 className="error-page-title">403 - Không có quyền truy cập</h1>
        <p className="error-page-description">
          Bạn không có quyền quản trị để truy cập trang này. Vui lòng liên hệ
          quản trị viên hệ thống nếu cần hỗ trợ.
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
