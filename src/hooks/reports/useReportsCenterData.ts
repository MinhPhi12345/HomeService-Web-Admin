import { useCallback, useEffect, useState } from 'react';
import type {
  BookingStatusPieItem,
  PrintSlipPayload,
  ReportDetailPayload,
  ReportKey,
  RevenueBarItem,
  TaskerPerformanceBarItem,
  UserRolePieItem,
} from '../../types/reportsCenter';
import {
  getBookingStatusPieData,
  getRevenueReportBarData,
  getTaskerPerformanceBarData,
  getUserRolesPieData,
} from '../../services/reports/reportsCenterService';
import { getErrorMessage } from '../../utils/errorHandler';
import { lastDaysRange } from '../../utils/dateRange';
import type { RevenueGroupBy } from '../../types';

export function useReportsCenterData() {
  const [activeTab, setActiveTab] = useState<'all' | ReportKey>('all');
  const [dateFrom, setDateFrom] = useState<string>(() => lastDaysRange(30).from);
  const [dateTo, setDateTo] = useState<string>(() => lastDaysRange(30).to);
  const [activePreset, setActivePreset] = useState<number | null>(30);
  const [groupBy, setGroupBy] = useState<RevenueGroupBy>('day');
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  const [revenueData, setRevenueData] = useState<RevenueBarItem[]>([]);
  const [revenueTotals, setRevenueTotals] = useState({ totalRevenue: 0, totalCommission: 0, transactionCount: 0 });
  const [bookingStatusData, setBookingStatusData] = useState<BookingStatusPieItem[]>([]);
  const [taskerData, setTaskerData] = useState<TaskerPerformanceBarItem[]>([]);
  const [userRoleData, setUserRoleData] = useState<UserRolePieItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDetail, setSelectedDetail] = useState<ReportDetailPayload | null>(null);
  const [printSlip, setPrintSlip] = useState<PrintSlipPayload | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [revRes, statusRes, taskerRes, usersRes] = await Promise.all([
          getRevenueReportBarData(dateFrom, dateTo),
          getBookingStatusPieData(dateFrom, dateTo),
          getTaskerPerformanceBarData(dateFrom, dateTo),
          getUserRolesPieData(),
        ]);
        if (!ignore) {
          setRevenueData(revRes.items);
          setGroupBy(revRes.groupBy);
          setRevenueTotals({
            totalRevenue: revRes.totalRevenue,
            totalCommission: revRes.totalCommission,
            transactionCount: revRes.transactionCount,
          });
          setBookingStatusData(statusRes);
          setTaskerData(taskerRes);
          setUserRoleData(usersRes);
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err));
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [dateFrom, dateTo, reloadTrigger]);

  const handleDateFromChange = useCallback((val: string) => {
    if (!val) return;
    setIsLoading(true);
    setActivePreset(null);
    setDateFrom(val);
  }, []);

  const handleDateToChange = useCallback((val: string) => {
    if (!val) return;
    setIsLoading(true);
    setActivePreset(null);
    setDateTo(val);
  }, []);

  const handleQuickPreset = useCallback((days: number) => {
    setIsLoading(true);
    const r = lastDaysRange(days);
    setActivePreset(days);
    setDateFrom(r.from);
    setDateTo(r.to);
  }, []);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setReloadTrigger((p) => p + 1);
  }, []);

  const handlePrintReport = useCallback(() => {
    setPrintSlip(null);
    setTimeout(() => {
      window.print();
    }, 100);
  }, []);

  const handlePrintSlip = useCallback((slip: PrintSlipPayload) => {
    setPrintSlip(slip);
    setTimeout(() => {
      window.print();
    }, 100);
  }, []);

  return {
    activeTab,
    setActiveTab,
    dateFrom,
    setDateFrom: handleDateFromChange,
    dateTo,
    setDateTo: handleDateToChange,
    activePreset,
    groupBy,
    revenueData,
    revenueTotals,
    bookingStatusData,
    taskerData,
    userRoleData,
    isLoading,
    error,
    selectedDetail,
    setSelectedDetail,
    printSlip,
    setPrintSlip,
    onQuickPreset: handleQuickPreset,
    onRetry: handleRetry,
    onPrintReport: handlePrintReport,
    onPrintSlip: handlePrintSlip,
  };
}
