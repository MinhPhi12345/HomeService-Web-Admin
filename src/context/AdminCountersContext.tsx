import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AdminCountersContext, type AdminCounters } from './useAdminCounters';
import { getPendingTaskerVerifications } from '../services/userService';
import { getDisputes } from '../services/disputeService';
import { getFlaggedReviews } from '../services/reviewService';
import { DisputeStatus } from '../types';

const REFRESH_MS = 60_000;

export function AdminCountersProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<AdminCounters>({ pendingTaskers: 0, openDisputes: 0, flaggedReviews: 0 });
  const [loaded, setLoaded] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let ignore = false;
    Promise.allSettled([
      getPendingTaskerVerifications(),
      getDisputes(DisputeStatus.Open),
      getFlaggedReviews(),
    ]).then(([t, d, r]) => {
      if (ignore) return;
      setCounts((prev) => ({
        pendingTaskers: t.status === 'fulfilled' ? t.value.length : prev.pendingTaskers,
        openDisputes: d.status === 'fulfilled' ? d.value.length : prev.openDisputes,
        flaggedReviews: r.status === 'fulfilled' ? r.value.length : prev.flaggedReviews,
      }));
      setLoaded(true);
    });
    return () => {
      ignore = true;
    };
  }, [tick]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((x) => x + 1), REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  const refresh = useCallback(() => setTick((x) => x + 1), []);

  return (
    <AdminCountersContext.Provider value={{ counts, loaded, refresh }}>{children}</AdminCountersContext.Provider>
  );
}
