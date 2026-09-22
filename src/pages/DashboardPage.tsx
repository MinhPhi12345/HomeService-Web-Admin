import { useEffect, useState } from "react";
import { getRevenueReport } from "../services/reportService";
import type { RevenueReport } from "../types";

// US31 - Báo cáo doanh thu (trang tổng quan)
export default function DashboardPage() {
  const [report, setReport] = useState<RevenueReport | null>(null);

  useEffect(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    getRevenueReport(from.toISOString(), to.toISOString())
      .then(setReport)
      .catch(() => setReport(null));
  }, []);

  return (
    <div>
      <h1>Tổng quan (30 ngày gần nhất)</h1>
      {report ? (
        <div style={{ display: "flex", gap: 24 }}>
          <div>
            <h3>Doanh thu</h3>
            <p>{report.totalRevenue.toLocaleString("vi-VN")}đ</p>
          </div>
          <div>
            <h3>Hoa hồng nền tảng</h3>
            <p>{report.totalCommission.toLocaleString("vi-VN")}đ</p>
          </div>
          <div>
            <h3>Số giao dịch</h3>
            <p>{report.transactionCount}</p>
          </div>
        </div>
      ) : (
        <p>Chưa có dữ liệu (backend chưa có giao dịch nào trong khoảng thời gian này).</p>
      )}
    </div>
  );
}
