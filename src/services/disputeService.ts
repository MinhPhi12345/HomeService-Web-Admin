import apiClient from './api';
import type { DisputeResponse, DisputeStatus, ResolveDisputeRequest } from '../types';
import { delayMock, isMockEnabled, mockDisputes } from './mock/mockData';

// EP07 - US28/US29: Admin xem và phân xử khiếu nại
export async function getDisputes(status?: DisputeStatus): Promise<DisputeResponse[]> {
  if (isMockEnabled) {
    const list = status === undefined ? mockDisputes : mockDisputes.filter((d) => d.status === status);
    return delayMock([...list]);
  }
  const { data } = await apiClient.get<DisputeResponse[]>('/disputes', {
    params: status === undefined ? undefined : { status },
  });
  return data;
}

export async function getDisputeById(id: number): Promise<DisputeResponse> {
  if (isMockEnabled) {
    const found = mockDisputes.find((d) => d.id === id);
    if (!found) throw new Error('Không tìm thấy khiếu nại.');
    return delayMock({ ...found });
  }
  const { data } = await apiClient.get<DisputeResponse>(`/disputes/${id}`);
  return data;
}

export async function resolveDispute(id: number, payload: ResolveDisputeRequest): Promise<DisputeResponse> {
  if (isMockEnabled) {
    const found = mockDisputes.find((d) => d.id === id);
    if (!found) throw new Error('Không tìm thấy khiếu nại.');
    Object.assign(found, {
      status: 1,
      resolution: payload.resolution,
      refundAmount: payload.refundAmount ?? null,
      adminNote: payload.adminNote,
      resolvedAt: new Date().toISOString(),
      redoScheduledTime: payload.redoScheduledTime ?? null,
    });
    return delayMock({ ...found });
  }
  const { data } = await apiClient.put<DisputeResponse>(`/disputes/${id}/resolve`, payload);
  return data;
}
