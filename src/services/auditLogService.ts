import apiClient from './api';
import type { AuditLogItem, PagedResult } from '../types';
import { delayMock, isMockEnabled, mockAuditLogs } from './mock/mockData';

export interface AuditLogQuery {
  action?: string;
  bookingId?: number;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

// NFR-16 – nhật ký kiểm toán (chỉ đọc)
export async function getAuditLogs(query: AuditLogQuery): Promise<PagedResult<AuditLogItem>> {
  if (isMockEnabled) {
    let items = [...mockAuditLogs];
    if (query.action) items = items.filter((i) => i.action === query.action);
    if (query.bookingId) items = items.filter((i) => i.bookingId === query.bookingId);
    const page = query.page ?? 1;
    const size = query.pageSize ?? 20;
    return delayMock({ items: items.slice((page - 1) * size, page * size), page, pageSize: size, totalCount: items.length });
  }
  const params = Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== ''));
  const { data } = await apiClient.get<PagedResult<AuditLogItem>>('/auditlogs', { params });
  return data;
}
