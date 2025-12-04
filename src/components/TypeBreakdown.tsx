'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TweetTypeBreakdown } from '@/lib/types';

interface TypeBreakdownProps {
  breakdown: TweetTypeBreakdown[];
  counts: {
    text: number;
    replies: number;
    quotes: number;
    retweets: number;
    media: number;
    total: number;
  };
}

const TYPE_COLORS: Record<string, string> = {
  'Plain Text': '#000000',
  'Replies': '#333333',
  'Quotes': '#666666',
  'Retweets': '#999999',
  'Media': '#CCCCCC',
};

export default function TypeBreakdown({ breakdown, counts }: TypeBreakdownProps) {
  const chartData = breakdown.map((item) => ({
    name: item.type,
    value: item.count,
  }));

  const renderCustomLabel = (entry: any) => {
    if (entry.value === 0) return '';
    // Find the corresponding breakdown item to get percentage
    const breakdownItem = breakdown.find((item) => item.count === entry.value);
    if (!breakdownItem || breakdownItem.percentage === 0) return '';
    return `${breakdownItem.percentage}%`;
  };

  return (
    <div className="space-y-6">
      {/* Pie Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#000"
              dataKey="value"
            >
              {breakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.type] || '#000000'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '2px solid #000',
                borderRadius: 0,
              }}
              formatter={(value: number, name: string) => [value, 'Tweets']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown Table */}
      <div className="space-y-2 border-t-2 border-black pt-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {breakdown.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between border-2 border-black bg-white p-3"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 border border-black"
                  style={{ backgroundColor: TYPE_COLORS[item.type] || '#000000' }}
                />
                <span className="text-xs font-bold uppercase text-black">{item.type}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-black">{item.count}</div>
                <div className="text-xs text-gray-600">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Summary */}
      <div className="border-t-2 border-black pt-4">
        <div className="flex justify-between">
          <span className="font-bold text-black uppercase">Total Tweets</span>
          <span className="text-2xl font-bold text-black">{counts.total}</span>
        </div>
      </div>
    </div>
  );
}
