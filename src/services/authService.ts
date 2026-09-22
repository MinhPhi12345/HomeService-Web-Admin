import apiClient from "./api";
import type { AuthResponse } from "../types";

// US02 - Đăng nhập (Admin dùng chung endpoint đăng nhập, phân biệt qua role trong AuthResponse)
export async function login(payload: { email: string; password: string }): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
}
