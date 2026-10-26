import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyRevenueItem } from '../../types';

interface DailyRevenueBarChartProps {
  data: DailyRevenueItem[];
}

export default function DailyRevenueBarChart({ data }: DailyRevenueBarChartProps) {
  return (
    <div className="card chart-card">
      <h3 className="chart-title">Doanh thu theo ngày (triệu đồng)</h3>
      <div className="chart-container" style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 16, left: -20, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: '#D9E3E6' }}
              tick={{ fill: '#8CA0A8', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#D9E3E6' }}
              tick={{ fill: '#8CA0A8', fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [`${value} tr`, 'Doanh thu']}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#D9E3E6',
                borderRadius: '8px',
                fontSize: 13,
              }}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === data.length - 1 ? '#FFB938' : '#14B8A6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
