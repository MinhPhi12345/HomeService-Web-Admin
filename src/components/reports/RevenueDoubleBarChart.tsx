import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyRevenueItem } from '../../types';

interface RevenueDoubleBarChartProps {
  data: DailyRevenueItem[];
}

export default function RevenueDoubleBarChart({ data }: RevenueDoubleBarChartProps) {
  return (
    <div className="card double-chart-card">
      <div className="card-header">
        <h3 className="card-title">Doanh thu & hoa hồng theo ngày (triệu đồng)</h3>
      </div>
      <div className="chart-container" style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="day" stroke="#8CA0A8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#8CA0A8" tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`${value} tr`, '']}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #D9E3E6',
              }}
            />
            <Legend
              formatter={(val) => (val === 'revenue' ? 'Doanh thu' : 'Hoa hồng')}
            />
            <Bar dataKey="revenue" name="revenue" fill="#14B8A6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="commission" name="commission" fill="#FFB938" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
