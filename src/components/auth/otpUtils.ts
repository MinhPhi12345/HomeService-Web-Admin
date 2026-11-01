import { useEffect, useState } from 'react';

// Đếm ngược thời gian chờ gửi lại mã
export function useResendTimer() {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return { left, restart: setLeft };
}

// "Vui lòng đợi 42 giây…" → 42
export function secondsFromMessage(message: string): number | null {
  const m = /đợi (\d+) giây/.exec(message);
  return m ? Number(m[1]) : null;
}

export const isStrongPassword = (v: string) => v.length >= 8 && v.length <= 50 && /[A-Za-z]/.test(v) && /\d/.test(v);
export const PASSWORD_RULE = 'Mật khẩu phải từ 8 ký tự, gồm chữ và số.';
