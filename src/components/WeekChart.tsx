'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DayStats } from '@/lib/types';

interface WeekChartProps {
  data: DayStats[];
}

export default function WeekChart({ data }: WeekChartProps) {
  // Format date labels to show day name
  const formattedData = data.map((item) => ({
    ...item,
    label: new Date(item.date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short' }),
  }));

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 11 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ fontWeight: '600', color: '#111827' }}
            formatter={(value: number) => [value, 'Tweets']}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {formattedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === formattedData.length - 1 ? '#3b82f6' : '#93c5fd'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
