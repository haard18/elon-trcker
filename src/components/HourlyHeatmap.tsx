'use client';

import { HourlyStats } from '@/lib/types';

interface HourlyHeatmapProps {
  data: HourlyStats[];
  maxCount: number;
  peakHours: number[];
}

export default function HourlyHeatmap({ data, maxCount, peakHours }: HourlyHeatmapProps) {
  const getIntensity = (count: number): number => {
    if (maxCount === 0) return 0;
    return Math.round((count / maxCount) * 100);
  };

  const getBackgroundColor = (count: number, hour: number): string => {
    const intensity = getIntensity(count);

    if (count === 0) {
      return 'bg-gray-100'; // Very light for no tweets
    }

    const isPeak = peakHours.includes(hour);
    const peakBorder = isPeak ? 'border-4 border-black' : '';

    if (intensity >= 80) return `bg-red-700 ${peakBorder}`;
    if (intensity >= 60) return `bg-red-500 ${peakBorder}`;
    if (intensity >= 40) return `bg-orange-500 ${peakBorder}`;
    if (intensity >= 20) return `bg-yellow-400 ${peakBorder}`;
    return 'bg-yellow-100';
  };

  const getTextColor = (count: number): string => {
    if (count === 0) return 'text-gray-500';
    const intensity = getIntensity(count);
    return intensity >= 50 ? 'text-white' : 'text-black';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-1 md:grid-cols-12">
        {data.map((hour) => (
          <div
            key={hour.hour}
            className={`flex flex-col items-center justify-center rounded-sm p-2 transition-all ${getBackgroundColor(hour.count, hour.hour)}`}
            title={`${String(hour.hour).padStart(2, '0')}:00 - ${hour.count} tweet${hour.count !== 1 ? 's' : ''}`}
          >
            <div className={`text-xs font-bold ${getTextColor(hour.count)}`}>{String(hour.hour).padStart(2, '0')}:00</div>
            <div className={`text-xs font-bold ${getTextColor(hour.count)}`}>{hour.count}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="border-t-2 border-gray-300 pt-4">
        <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-5">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-100" />
            <span className="text-gray-600">Silent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-yellow-100" />
            <span className="text-gray-600">Very Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-yellow-400" />
            <span className="text-gray-600">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-orange-500" />
            <span className="text-gray-600">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-red-700" />
            <span className="text-gray-600">Peak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
