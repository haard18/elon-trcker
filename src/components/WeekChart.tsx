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
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#000', fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '3px solid #000',
              borderRadius: 0,
              boxShadow: '4px 4px 0 #000',
            }}
            labelStyle={{ fontWeight: 'bold', color: '#000' }}
            formatter={(value: number) => [value, 'Tweets']}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="count" radius={0}>
            {formattedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === formattedData.length - 1 ? '#000' : '#666'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
