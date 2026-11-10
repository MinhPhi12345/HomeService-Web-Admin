import apiClient from './api';
import type { AppealDetail, AppealListItem, AppealStatus } from '../types';
import { isMockEnabled, delayMock } from './mock/mockData';

// US48 (SRS v1.8) – yêu cầu mở khóa tài khoản
export async function getAppeals(status?: AppealStatus): Promise<AppealListItem[]> {
  if (isMockEnabled) return delayMock([]);
  const { data } = await apiClient.get<AppealListItem[]>('/account-appeals', {
    params: { status: status ?? undefined },
  });
  return data;
}

export async function getAppeal(id: number): Promise<AppealDetail> {
  const { data } = await apiClient.get<AppealDetail>(`/account-appeals/${id}`);
  return data;
}

export async function approveAppeal(id: number, note?: string): Promise<void> {
  await apiClient.put(`/account-appeals/${id}/approve`, { note: note?.trim() || null });
}

export async function rejectAppeal(id: number, note: string): Promise<void> {
  await apiClient.put(`/account-appeals/${id}/reject`, { note: note.trim() });
}
