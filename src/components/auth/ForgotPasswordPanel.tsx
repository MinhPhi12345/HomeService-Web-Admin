import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import Button from '../common/Button';
import OtpCodeInput from './OtpCodeInput';
import { PASSWORD_RULE, isStrongPassword, secondsFromMessage, useResendTimer } from './otpUtils';
import { forgotPassword, resetPassword } from '../../services/authService';
import { getErrorMessage } from '../../utils/errorHandler';

interface ForgotPasswordPanelProps {
  initialEmail: string;
  onBack: (message?: string, email?: string) => void;
}

// Quên mật khẩu (Admin): email → mã OTP gửi về email → mật khẩu mới
export default function ForgotPasswordPanel({ initialEmail, onBack }: ForgotPasswordPanelProps) {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [masked, setMasked] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const timer = useResendTimer();

  async function send() {
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError('Email không đúng định dạng.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const sent = await forgotPassword(clean);
      setMasked(sent.maskedEmail);
      setInfo(`Nếu email đã đăng ký, mã OTP đã được gửi tới ${sent.maskedEmail} (hiệu lực 5 phút).`);
      setCode('');
      timer.restart(sent.resendAfterSeconds);
      setStep('reset');
    } catch (err) {
      const msg = getErrorMessage(err);
      const wait = secondsFromMessage(msg);
      if (wait) {
        timer.restart(wait);
        setStep('reset');
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return setError('Vui lòng nhập đủ 6 số của mã OTP.');
    if (!isStrongPassword(password)) return setError(PASSWORD_RULE);
    if (confirm !== password) return setError('Mật khẩu xác nhận không khớp.');
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase(), code, password);
      onBack('Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.', email.trim().toLowerCase());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className="otp-back-link" onClick={() => onBack()}>
        <ArrowLeft size={16} /> Quay lại đăng nhập
      </button>
      <h2 className="otp-panel-title">{step === 'email' ? 'Quên mật khẩu' : 'Đặt mật khẩu mới'}</h2>
      <p className="otp-panel-lead">
        {step === 'email'
          ? 'Nhập email tài khoản quản trị, hệ thống sẽ gửi mã OTP 6 số để đặt lại mật khẩu.'
          : `Nhập mã đã gửi tới ${masked || email} và mật khẩu mới.`}
      </p>

      {info && !error && (
        <div className="otp-info-alert" role="status">
          <CheckCircle2 size={18} />
          <span>{info}</span>
        </div>
      )}
      {error && (
        <div className="login-error-alert" role="alert">
          <AlertCircle size={18} className="login-error-icon" />
          <span className="login-error-text">{error}</span>
        </div>
      )}

      {step === 'email' ? (
        <form
          className="login-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <div className="form-group">
            <label htmlFor="fp-email" className="form-label">
              Email <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="fp-email"
                type="email"
                className="form-input"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>
          <Button type="submit" variant="primary" size="lg" loading={loading} className="login-submit-btn">
            Gửi mã OTP
          </Button>
        </form>
      ) : (
        <form className="login-form" noValidate onSubmit={handleReset}>
          <div className="form-group">
            <label className="form-label">
              Mã OTP <span className="required-star">*</span>
            </label>
            <OtpCodeInput value={code} onChange={setCode} disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="fp-password" className="form-label">
              Mật khẩu mới <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <KeyRound size={18} className="input-icon" />
              <input
                id="fp-password"
                type="password"
                className="form-input"
                placeholder="Từ 8 ký tự, có chữ và số"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="fp-confirm" className="form-label">
              Nhập lại mật khẩu mới <span className="required-star">*</span>
            </label>
            <input
              id="fp-confirm"
              type="password"
              className="form-input"
              placeholder="Nhập lại mật khẩu mới"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" variant="primary" size="lg" loading={loading} className="login-submit-btn">
            Đặt lại mật khẩu
          </Button>
          <p className="otp-resend-line">
            Chưa nhận được mã?{' '}
            {timer.left > 0 ? (
              <span>Gửi lại sau {timer.left} giây</span>
            ) : (
              <button type="button" className="otp-link-btn" onClick={() => void send()} disabled={loading}>
                Gửi lại mã
              </button>
            )}
          </p>
        </form>
      )}
    </>
  );
}
