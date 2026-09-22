import apiClient from "./api";
import type { AdminUser } from "../types";

// EP08 - US30: Quản lý danh sách khách hàng & Tasker (khóa/mở khóa)
export async function getUsers(role?: "Customer" | "Tasker" | "Admin"): Promise<AdminUser[]> {
  const { data } = await apiClient.get<AdminUser[]>("/users", { params: role ? { role } : undefined });
  return data;
}

export async function setUserActiveStatus(id: number, isActive: boolean) {
  await apiClient.put(`/users/${id}/active-status`, null, { params: { isActive } });
}

// EP01 - US04: xác thực hồ sơ Tasker
export async function getPendingTaskerVerifications() {
  const { data } = await apiClient.get("/taskers/pending-verification");
  return data;
}

export async function setTaskerVerification(taskerProfileId: number, approve: boolean) {
  await apiClient.put(`/taskers/${taskerProfileId}/verification`, null, { params: { approve } });
}
