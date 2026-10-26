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

export function useReportsCenterData() {
  const [activeTab, setActiveTab] = useState<'all' | ReportKey>('all');
  const [dateFrom, setDateFrom] = useState<string>('2026-10-01');
  const [dateTo, setDateTo] = useState<string>('2026-10-26');
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
          getTaskerPerformanceBarData(),
          getUserRolesPieData(),
        ]);
        if (!ignore) {
          setRevenueData(revRes.items);
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
    setIsLoading(true);
    setDateFrom(val);
  }, []);

  const handleDateToChange = useCallback((val: string) => {
    setIsLoading(true);
    setDateTo(val);
  }, []);

  const handleQuickPreset = useCallback((days: number) => {
    setIsLoading(true);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setDateFrom(start.toISOString().split('T')[0]);
    setDateTo(end.toISOString().split('T')[0]);
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
