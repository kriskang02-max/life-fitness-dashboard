import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DayActivity } from '../types'

interface ActivityChartProps {
  data: DayActivity[]
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="card">
      <h2>Weekly Steps</h2>
      <p className="subtitle">Steps recorded across the last 7 days</p>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#24304f" vertical={false} />
            <XAxis dataKey="day" stroke="#93a2c0" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#93a2c0" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(56,189,248,0.08)' }}
              contentStyle={{
                background: '#131c31',
                border: '1px solid #24304f',
                borderRadius: 12,
                color: '#e6edf7',
              }}
            />
            <Bar dataKey="steps" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
