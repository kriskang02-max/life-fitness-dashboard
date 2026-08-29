import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface TrendPoint {
  time: string
  bpm: number
}

interface TrendChartProps {
  data: TrendPoint[]
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="card">
      <h2>Heart Rate</h2>
      <p className="subtitle">Beats per minute throughout the day</p>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="bpmFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#24304f" vertical={false} />
            <XAxis dataKey="time" stroke="#93a2c0" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#93a2c0" fontSize={12} tickLine={false} axisLine={false} domain={[40, 140]} />
            <Tooltip
              contentStyle={{
                background: '#131c31',
                border: '1px solid #24304f',
                borderRadius: 12,
                color: '#e6edf7',
              }}
            />
            <Area
              type="monotone"
              dataKey="bpm"
              stroke="#38bdf8"
              strokeWidth={2.5}
              fill="url(#bpmFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
