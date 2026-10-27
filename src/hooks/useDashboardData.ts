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
import { fillSeries, lastDaysRange, pickGroupBy, toRangeParams } from '../utils/dateRange';

export function useDashboardData() {
  const [days, setDays] = useState<number>(30);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [bookingsSummary, setBookingsSummary] = useState<BookingsSummaryItem[]>([]);
  const [taskerPerformance, setTaskerPerformance] = useState<TaskerPerformanceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let ignore = false;
    const range = lastDaysRange(days);
    const groupBy = pickGroupBy(range.from, range.to);
    const { from, to } = toRangeParams(range.from, range.to);

    Promise.all([
      getRevenueReport(from, to, groupBy),
      getBookingsSummary(from, to),
      getTaskerPerformance(from, to),
    ])
      .then(([revData, summaryData, taskerData]) => {
        if (!ignore) {
          setRevenueReport({ ...revData, series: fillSeries(revData.series, range.from, range.to, groupBy) });
          setBookingsSummary(summaryData);
          setTaskerPerformance(taskerData);
          setError(null);
          setUpdatedAt(new Date());
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
    updatedAt,
    onFilterChange: handleFilterChange,
    onRetry: handleRetry,
  };
}
