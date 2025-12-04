'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WeekdayStats } from '@/lib/types';

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface WeekdayDistributionProps {
  data: WeekdayStats[];
  topDay: number;
  topDayName: string;
}

export default function WeekdayDistribution({ data, topDay, topDayName }: WeekdayDistributionProps) {
  const formattedData = data.map((day) => ({
    ...day,
    label: WEEKDAY_NAMES[day.weekday],
  }));

  const maxCount = Math.max(...formattedData.map((d) => d.count));

  return (
    <div className="space-y-4">
      <div className="h-56 w-full">
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
              labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey="count" radius={0}>
              {formattedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.weekday === topDay ? '#000' : '#999'}
                  opacity={entry.weekday === topDay ? 1 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Day Highlight */}
      <div className="border-t-2 border-black pt-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-gray-600">Heaviest Tweeting Day</div>
            <div className="text-2xl font-bold text-black">{topDayName}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold uppercase text-gray-600">Tweets</div>
            <div className="text-2xl font-bold text-black">{maxCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
