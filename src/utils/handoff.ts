import type { AuthResponse } from '../types';
import { UserRole } from '../types';

/**
 * Nhận phiên đăng nhập do Web Customer chuyển sang (#auth=… trong URL, base64url JSON
 * { token, user: { userId, fullName, email, role }, remember }).
 * localStorage không dùng chung giữa 2 website nên token đi qua URL hash – hash không gửi lên server
 * và được xóa khỏi thanh địa chỉ ngay khi đọc xong. Chỉ chấp nhận tài khoản Admin.
 * Gọi trước khi render ứng dụng.
 */
export function consumeHandoff(): void {
  const m = window.location.hash.match(/^#auth=(.+)$/);
  if (!m) return;
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  try {
    const b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
    const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))) as {
      token?: string;
      user?: { userId: number; fullName: string; email: string; role: number };
    };
    if (!payload.token || !payload.user || payload.user.role !== UserRole.Admin) return;

    const auth: AuthResponse = {
      userId: payload.user.userId,
      fullName: payload.user.fullName,
      email: payload.user.email,
      role: UserRole.Admin,
      accessToken: payload.token,
      expiresAt: jwtExpiry(payload.token),
    };
    localStorage.setItem('accessToken', auth.accessToken);
    localStorage.setItem('adminUser', JSON.stringify(auth));
  } catch {
    /* hash hỏng: bỏ qua, người dùng đăng nhập lại bình thường */
  }
}

/** Đọc claim exp của JWT (giây) → ISO; không đọc được thì cho hạn 1 giờ. */
function jwtExpiry(token: string): string {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(part + '='.repeat((4 - (part.length % 4)) % 4))) as { exp?: number };
    if (json.exp) return new Date(json.exp * 1000).toISOString();
  } catch {
    /* ignore */
  }
  return new Date(Date.now() + 3600_000).toISOString();
}
