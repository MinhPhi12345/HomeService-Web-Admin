import { useState } from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import OtpCodeInput from './OtpCodeInput';
import { PASSWORD_RULE, isStrongPassword, secondsFromMessage, useResendTimer } from './otpUtils';
import { changePassword, sendChangePasswordOtp } from '../../services/authService';
import { getErrorMessage } from '../../utils/errorHandler';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Đổi mật khẩu Admin: mật khẩu hiện tại + mã OTP gửi về email + mật khẩu mới
export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const timer = useResendTimer();

  function reset() {
    setCurrent('');
    setPassword('');
    setConfirm('');
    setCode('');
    setSentTo('');
    setError(null);
  }

  function close() {
    reset();
    onClose();
  }

  function validate(): boolean {
    if (!current) return fail('Vui lòng nhập mật khẩu hiện tại.');
    if (!isStrongPassword(password)) return fail(PASSWORD_RULE);
    if (password === current) return fail('Mật khẩu mới phải khác mật khẩu hiện tại.');
    if (confirm !== password) return fail('Mật khẩu xác nhận không khớp.');
    setError(null);
    return true;
  }

  function fail(msg: string) {
    setError(msg);
    return false;
  }

  async function sendCode() {
    if (!validate()) return;
    setLoading(true);
    try {
      const sent = await sendChangePasswordOtp();
      setSentTo(sent.maskedEmail);
      setCode('');
      timer.restart(sent.resendAfterSeconds);
    } catch (err) {
      const msg = getErrorMessage(err);
      const wait = secondsFromMessage(msg);
      if (wait) timer.restart(wait);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!validate()) return;
    if (code.length !== 6) return void fail('Vui lòng nhập đủ 6 số của mã OTP.');
    setLoading(true);
    try {
      await changePassword(current, code, password);
      window.dispatchEvent(
        new CustomEvent('app:toast', { detail: { type: 'success', message: 'Đổi mật khẩu thành công.' } }),
      );
      close();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Đổi mật khẩu"
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={loading}>
            Hủy
          </Button>
          {sentTo ? (
            <Button variant="primary" loading={loading} disabled={code.length !== 6} onClick={() => void submit()}>
              Đổi mật khẩu
            </Button>
          ) : (
            <Button variant="primary" loading={loading} onClick={() => void sendCode()}>
              Gửi mã OTP về email
            </Button>
          )}
        </>
      }
    >
      <div className="otp-info-alert">
        <ShieldCheck size={18} />
        <span>Đổi mật khẩu cần mật khẩu hiện tại và mã OTP gửi về email đăng nhập.</span>
      </div>
      {error && (
        <div className="login-error-alert" role="alert">
          <AlertCircle size={18} className="login-error-icon" />
          <span className="login-error-text">{error}</span>
        </div>
      )}
      <div className="form-group">
        <label htmlFor="cp-current" className="form-label">
          Mật khẩu hiện tại <span className="required-star">*</span>
        </label>
        <input id="cp-current" type="password" className="form-input" value={current}
          onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
      </div>
      <div className="form-group">
        <label htmlFor="cp-new" className="form-label">
          Mật khẩu mới <span className="required-star">*</span>
        </label>
        <input id="cp-new" type="password" className="form-input" placeholder="Từ 8 ký tự, có chữ và số" value={password}
          onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
      </div>
      <div className="form-group">
        <label htmlFor="cp-confirm" className="form-label">
          Nhập lại mật khẩu mới <span className="required-star">*</span>
        </label>
        <input id="cp-confirm" type="password" className="form-input" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
      </div>
      {sentTo && (
        <div className="form-group">
          <label className="form-label">Mã OTP đã gửi tới {sentTo}</label>
          <OtpCodeInput value={code} onChange={setCode} disabled={loading} />
          <p className="otp-resend-line">
            {timer.left > 0 ? (
              <span>Gửi lại mã sau {timer.left} giây</span>
            ) : (
              <button type="button" className="otp-link-btn" onClick={() => void sendCode()} disabled={loading}>
                Gửi lại mã
              </button>
            )}
          </p>
        </div>
      )}
    </Modal>
  );
}
