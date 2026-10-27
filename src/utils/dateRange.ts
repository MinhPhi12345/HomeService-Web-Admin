import type { RevenueGroupBy, RevenuePoint } from '../types';

// Ngày dạng "yyyy-MM-dd" theo giờ máy người dùng
export function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Khoảng mặc định: N ngày gần nhất tính tới hôm nay (gồm cả hôm nay). */
export function lastDaysRange(days: number): { from: string; to: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - Math.max(0, days - 1));
  return { from: toDateInput(start), to: toDateInput(end) };
}

/**
 * Đổi 2 ô ngày (yyyy-MM-dd, giờ địa phương) thành ISO UTC gửi Backend:
 * from = 00:00:00 ngày bắt đầu, to = 23:59:59 ngày kết thúc → không bị mất dữ liệu của ngày cuối.
 */
export function toRangeParams(from: string, to: string): { from: string; to: string } {
  const f = new Date(`${from}T00:00:00`);
  const t = new Date(`${to}T23:59:59.999`);
  return { from: f.toISOString(), to: t.toISOString() };
}

export function daysBetween(from: string, to: string): number {
  const f = new Date(`${from}T00:00:00`).getTime();
  const t = new Date(`${to}T00:00:00`).getTime();
  return Math.round((t - f) / 86_400_000) + 1;
}

/** ≤ 62 ngày: theo ngày; ≤ 3 năm: theo tháng; còn lại theo năm. */
export function pickGroupBy(from: string, to: string): RevenueGroupBy {
  const days = daysBetween(from, to);
  if (days <= 62) return 'day';
  if (days <= 1100) return 'month';
  return 'year';
}

export function groupByLabel(g: RevenueGroupBy): string {
  return g === 'day' ? 'ngày' : g === 'month' ? 'tháng' : 'năm';
}

/** "2026-10-16" → "16/10" · "2026-10" → "T10/2026" · "2026" → "2026" */
export function formatPeriod(period: string, long = false): string {
  const parts = period.split('-');
  if (parts.length === 3) return long ? `${parts[2]}/${parts[1]}/${parts[0]}` : `${parts[2]}/${parts[1]}`;
  if (parts.length === 2) return long ? `Tháng ${Number(parts[1])}/${parts[0]}` : `T${Number(parts[1])}/${parts[0]}`;
  return long ? `Năm ${period}` : period;
}

/** Thêm các kỳ không có giao dịch (giá trị 0) để biểu đồ liền mạch theo thời gian. */
export function fillSeries(series: RevenuePoint[], from: string, to: string, groupBy: RevenueGroupBy): RevenuePoint[] {
  const map = new Map(series.map((s) => [s.period, s]));
  const keys: string[] = [];
  const cur = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  let guard = 0;
  while (cur <= end && guard < 400) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    const key = groupBy === 'day' ? `${y}-${m}-${d}` : groupBy === 'month' ? `${y}-${m}` : `${y}`;
    if (keys[keys.length - 1] !== key) keys.push(key);
    if (groupBy === 'day') cur.setDate(cur.getDate() + 1);
    else if (groupBy === 'month') cur.setMonth(cur.getMonth() + 1, 1);
    else cur.setFullYear(cur.getFullYear() + 1, 0, 1);
    guard += 1;
  }
  // kỳ có dữ liệu nhưng lệch múi giờ (ngoài danh sách) vẫn được giữ lại
  series.forEach((s) => {
    if (!keys.includes(s.period)) keys.push(s.period);
  });
  keys.sort();
  return keys.map((k) => map.get(k) ?? { period: k, revenue: 0, commission: 0, transactionCount: 0 });
}

/** Khoảng from/to (yyyy-MM-dd) của 1 kỳ biểu đồ – dùng khi cần lọc theo kỳ. */
export function periodBounds(period: string): { from: string; to: string } {
  const parts = period.split('-').map(Number);
  if (parts.length === 3) return { from: period, to: period };
  if (parts.length === 2) {
    const last = new Date(parts[0], parts[1], 0).getDate();
    return { from: `${period}-01`, to: `${period}-${String(last).padStart(2, '0')}` };
  }
  return { from: `${period}-01-01`, to: `${period}-12-31` };
}
