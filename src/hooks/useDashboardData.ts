import { useCallback, useEffect, useState } from 'react';
import {
  getBookingsSummary,
  getRevenueReport,
  getTaskerPerformance,
} from '../services/reportService';
import type {
  BookingsSummaryItem,
  RevenueReport,
  TaskerPerformanceItem,
} from '../types';
import { getErrorMessage } from '../utils/errorHandler';

export function useDashboardData() {
  const [days, setDays] = useState<number>(30);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [bookingsSummary, setBookingsSummary] = useState<BookingsSummaryItem[]>([]);
  const [taskerPerformance, setTaskerPerformance] = useState<TaskerPerformanceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  useEffect(() => {
    let ignore = false;

    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);

    const fromIso = from.toISOString();
    const toIso = to.toISOString();

    Promise.all([
      getRevenueReport(fromIso, toIso),
      getBookingsSummary(fromIso, toIso),
      getTaskerPerformance(),
    ])
      .then(([revData, summaryData, taskerData]) => {
        if (!ignore) {
          setRevenueReport(revData);
          setBookingsSummary(summaryData);
          setTaskerPerformance(taskerData);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(getErrorMessage(err));
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [days, reloadTrigger]);

  const handleFilterChange = useCallback((newDays: number) => {
    setIsLoading(true);
    setDays(newDays);
  }, []);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setReloadTrigger((prev) => prev + 1);
  }, []);

  return {
    days,
    revenueReport,
    bookingsSummary,
    taskerPerformance,
    isLoading,
    error,
    onFilterChange: handleFilterChange,
    onRetry: handleRetry,
  };
}
