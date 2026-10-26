import apiClient from './api';
import type { AuthResponse, LoginRequest } from '../types';
import { delayMock, isMockEnabled, mockAuthUser } from './mock/mockData';

// US02 - Đăng nhập (Admin dùng chung endpoint đăng nhập, phân biệt qua role trong AuthResponse)
export async function login(payload: LoginRequest): Promise<AuthResponse> {
  if (isMockEnabled) {
    return delayMock(mockAuthUser);
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
