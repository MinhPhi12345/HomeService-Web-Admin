import apiClient from './api';
import type {
  ServiceCategoryResponse,
  UpsertServiceCategoryRequest,
} from '../types';
import {
  delayMock,
  isMockEnabled,
  mockServiceCategories,
} from './mock/mockData';

// EP02 - US07/US08/US09/US11: quản lý danh mục & bảng giá dịch vụ
export async function getServiceCategories(
  keyword?: string,
): Promise<ServiceCategoryResponse[]> {
  if (isMockEnabled) {
    if (!keyword) {
      return delayMock([...mockServiceCategories]);
    }
    const kw = keyword.trim().toLowerCase();
    return delayMock(
      mockServiceCategories.filter((s) => s.name.toLowerCase().includes(kw)),
    );
  }

  const { data } = await apiClient.get<ServiceCategoryResponse[]>(
    '/servicecategories',
    {
      // Admin thấy cả dịch vụ đã ẩn (xóa mềm) để khôi phục
      params: { keyword: keyword || undefined, includeInactive: true },
    },
  );
  return data;
}

export async function createServiceCategory(
  payload: UpsertServiceCategoryRequest,
): Promise<ServiceCategoryResponse> {
  if (isMockEnabled) {
    const newItem: ServiceCategoryResponse = {
      id: Date.now(),
      name: payload.name,
      description: payload.description ?? null,
      basePrice: payload.basePrice,
      unit: payload.unit,
      iconUrl: payload.iconUrl ?? null,
      isActive: true,
    };
    mockServiceCategories.push(newItem);
    return delayMock(newItem);
  }

  const { data } = await apiClient.post<ServiceCategoryResponse>(
    '/servicecategories',
    payload,
  );
  return data;
}

export async function updateServiceCategory(
  id: number,
  payload: UpsertServiceCategoryRequest,
): Promise<void> {
  if (isMockEnabled) {
    const index = mockServiceCategories.findIndex((s) => s.id === id);
    if (index !== -1) {
      mockServiceCategories[index] = {
        ...mockServiceCategories[index],
        name: payload.name,
        description: payload.description ?? null,
        basePrice: payload.basePrice,
        unit: payload.unit,
        iconUrl: payload.iconUrl ?? null,
      };
    }
    await delayMock(null);
    return;
  }

  await apiClient.put(`/servicecategories/${id}`, payload);
}

export async function deleteServiceCategory(id: number): Promise<void> {
  if (isMockEnabled) {
    const index = mockServiceCategories.findIndex((s) => s.id === id);
    if (index !== -1) {
      mockServiceCategories[index].isActive = false;
    }
    await delayMock(null);
    return;
  }

  await apiClient.delete(`/servicecategories/${id}`);
}

// US09 - khôi phục dịch vụ đã ẩn
export async function restoreServiceCategory(id: number): Promise<void> {
  if (isMockEnabled) {
    const index = mockServiceCategories.findIndex((s) => s.id === id);
    if (index !== -1) {
      mockServiceCategories[index].isActive = true;
    }
    await delayMock(null);
    return;
  }

  await apiClient.put(`/servicecategories/${id}/restore`);
}
