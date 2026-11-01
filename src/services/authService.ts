import apiClient from './api';
import type { AuthResponse, LoginRequest } from '../types';
import { UserRole } from '../types';
import { delayMock, isMockEnabled } from './mock/mockData';

// US02 - Đăng nhập (Admin dùng chung endpoint đăng nhập, phân biệt qua role trong AuthResponse)
export async function login(payload: LoginRequest): Promise<AuthResponse> {
  if (isMockEnabled) {
    return delayMock({
      userId: 1,
      fullName: 'Quản trị viên',
      email: payload.email,
      role: UserRole.Admin,
      accessToken: 'mock_jwt_access_token_admin',
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    });
  }
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
}

// US03 - Đăng xuất (client-side: xóa token; nếu cần revoke thì bổ sung bảng RefreshToken)
export async function logoutApi(): Promise<{ message: string }> {
  if (isMockEnabled) {
    return delayMock({ message: 'Đăng xuất thành công.' });
  }
  const { data } = await apiClient.post<{ message: string }>('/auth/logout');
  return data;
}

// ---------------- Mã OTP qua email

export interface OtpSentResponse {
  maskedEmail: string;
  expiresAt: string;
  resendAfterSeconds: number;
}

// Quên mật khẩu – bước 1: gửi mã OTP về email
export async function forgotPassword(email: string): Promise<OtpSentResponse> {
  const { data } = await apiClient.post<OtpSentResponse>('/auth/forgot-password', { email });
  return data;
}

// Quên mật khẩu – bước 2: mã OTP + mật khẩu mới
export async function resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/reset-password', { email, code, newPassword });
  return data;
}

// Đổi mật khẩu khi đã đăng nhập – bước 1: gửi mã OTP về email của tài khoản
export async function sendChangePasswordOtp(): Promise<OtpSentResponse> {
  const { data } = await apiClient.post<OtpSentResponse>('/profile/password/otp');
  return data;
}

// Đổi mật khẩu – bước 2: mật khẩu hiện tại + mã OTP + mật khẩu mới
export async function changePassword(currentPassword: string, code: string, newPassword: string): Promise<{ message: string }> {
  const { data } = await apiClient.put<{ message: string }>('/profile/password', { currentPassword, code, newPassword });
  return data;
}
