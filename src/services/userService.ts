import apiClient from './api';
import type { AdminUserItem, PendingTaskerItem } from '../types';
import {
  delayMock,
  isMockEnabled,
  mockAdminUsers,
  mockPendingTaskers,
} from './mock/mockData';

// EP08 - US30: Quản lý danh sách khách hàng & Tasker (khóa/mở khóa)
export async function getUsers(params?: {
  role?: string;
  keyword?: string;
  isActive?: boolean;
}): Promise<AdminUserItem[]> {
  if (isMockEnabled) {
    let result = [...mockAdminUsers];
    if (params?.role) {
      const parsed =
        params.role === 'Customer' ? 0 : params.role === 'Tasker' ? 1 : 2;
      result = result.filter((u) => u.role === parsed);
    }
    if (params?.keyword) {
      const kw = params.keyword.trim().toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(kw) ||
          u.email.toLowerCase().includes(kw) ||
          (u.phoneNumber && u.phoneNumber.includes(kw)),
      );
    }
    if (params?.isActive !== undefined) {
      result = result.filter((u) => u.isActive === params.isActive);
    }
    return delayMock(result);
  }

  const { data } = await apiClient.get<AdminUserItem[]>('/users', { params });
  return data;
}

export async function setUserActiveStatus(
  id: number,
  isActive: boolean,
): Promise<void> {
  if (isMockEnabled) {
    const user = mockAdminUsers.find((u) => u.id === id);
    if (user) {
      user.isActive = isActive;
    }
    await delayMock(null);
    return;
  }

  await apiClient.put(`/users/${id}/active-status`, null, {
    params: { isActive },
  });
}

// EP01 - US04: xác thực hồ sơ Tasker
export async function getPendingTaskerVerifications(): Promise<
  PendingTaskerItem[]
> {
  if (isMockEnabled) {
    return delayMock([...mockPendingTaskers]);
  }

  const { data } = await apiClient.get<PendingTaskerItem[]>(
    '/taskers/pending-verification',
  );
  return data;
}

export async function setTaskerVerification(
  taskerProfileId: number,
  approve: boolean,
): Promise<void> {
  if (isMockEnabled) {
    const idx = mockPendingTaskers.findIndex((t) => t.id === taskerProfileId);
    if (idx !== -1) {
      mockPendingTaskers.splice(idx, 1);
    }
    await delayMock(null);
    return;
  }

  await apiClient.put(
    `/taskers/${taskerProfileId}/verification`,
    null,
    {
      params: { approve },
    },
  );
}
