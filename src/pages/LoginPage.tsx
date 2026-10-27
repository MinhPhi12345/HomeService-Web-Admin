import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { login } from '../services/authService';
import { UserRole } from '../types';
import { getErrorMessage } from '../utils/errorHandler';
import Button from '../components/common/Button';

// US02 - Đăng nhập (Admin)
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(() => {
    const expiredMsg = sessionStorage.getItem('auth_message');
    if (expiredMsg) {
      sessionStorage.removeItem('auth_message');
      return expiredMsg;
    }
    return null;
  });
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  if (user && user.role === UserRole.Admin && (!user.expiresAt || new Date(user.expiresAt) > new Date())) {
    return <Navigate to="/" replace />;
  }

  function validate(): boolean {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setEmailError('Vui lòng nhập email.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError('Email không đúng định dạng.');
      isValid = false;
    }
    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu.');
      isValid = false;
    }
    return isValid;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await login({ email: email.trim(), password });
      if (res.role !== UserRole.Admin) {
        setError('Tài khoản không có quyền quản trị.');
        return;
      }
      setUser(res);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand-icon">
            <ShieldCheck size={32} />
          </div>
          <h1 className="login-title">HomeService Admin</h1>
          <p className="login-subtitle">Hệ thống quản trị dịch vụ tại nhà</p>
        </div>

        {error && (
          <div className="login-error-alert" role="alert">
            <AlertCircle size={18} className="login-error-icon" />
            <span className="login-error-text">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
                type="email"
                className={`form-input ${emailError ? 'input-error' : ''}`}
                placeholder="email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {emailError && <span className="form-error">{emailError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Mật khẩu <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type="password"
                className={`form-input ${passwordError ? 'input-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            {passwordError && <span className="form-error">{passwordError}</span>}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="login-submit-btn"
          >
            Đăng nhập
          </Button>
        </form>
      </div>
    </div>
  );
}
