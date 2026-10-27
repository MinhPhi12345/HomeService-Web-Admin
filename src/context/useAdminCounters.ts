import { createContext, useContext } from 'react';

export interface AdminCounters {
  pendingTaskers: number;
  openDisputes: number;
  flaggedReviews: number;
}

export interface AdminCountersValue {
  counts: AdminCounters;
  loaded: boolean;
  refresh: () => void;
}

export const AdminCountersContext = createContext<AdminCountersValue>({
  counts: { pendingTaskers: 0, openDisputes: 0, flaggedReviews: 0 },
  loaded: false,
  refresh: () => {},
});

/** Số việc cần Admin xử lý (badge Sidebar, chuông thông báo, tiêu đề trang). */
export function useAdminCounters() {
  return useContext(AdminCountersContext);
}
