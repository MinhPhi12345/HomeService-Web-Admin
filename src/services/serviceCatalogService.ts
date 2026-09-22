import apiClient from "./api";
import type { ServiceCategory } from "../types";

// EP02 - US07/US08/US09/US11: quản lý danh mục & bảng giá dịch vụ
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const { data } = await apiClient.get<ServiceCategory[]>("/servicecategories");
  return data;
}

export async function createServiceCategory(payload: Omit<ServiceCategory, "id" | "isActive">) {
  const { data } = await apiClient.post<ServiceCategory>("/servicecategories", payload);
  return data;
}

export async function updateServiceCategory(id: number, payload: Omit<ServiceCategory, "id" | "isActive">) {
  await apiClient.put(`/servicecategories/${id}`, payload);
}

export async function deleteServiceCategory(id: number) {
  await apiClient.delete(`/servicecategories/${id}`);
}
