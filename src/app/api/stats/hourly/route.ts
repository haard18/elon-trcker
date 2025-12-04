import { NextResponse } from 'next/server';
import { getTweetsCollection } from '@/lib/mongodb';

export interface HourlyStats {
  hour: number;
  count: number;
}

export interface HourlyStatsResponse {
  hourly: HourlyStats[];
  peakHours: number[];
  silentHours: number[];
  maxCount: number;
  totalTweets: number;
}

export async function GET() {
  try {
    const collection = await getTweetsCollection();

    // Initialize array with 24 hours, all with count 0
    const hourlyData: HourlyStats[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0,
    }));

    // Aggregate tweets by hour
    const results = await collection
      .aggregate([
        {
          $group: {
            _id: {
              $hour: '$created_at',
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    // Map aggregation results to hourly data
    results.forEach((result: any) => {
      const hour = result._id;
      if (hour >= 0 && hour < 24) {
        hourlyData[hour].count = result.count;
      }
    });

    // Calculate peak and silent hours
    const counts = hourlyData.map((h) => h.count);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);

    const peakHours = hourlyData
      .filter((h) => h.count === maxCount && maxCount > 0)
      .map((h) => h.hour);

    const silentHours = hourlyData.filter((h) => h.count === 0).map((h) => h.hour);

    const totalTweets = hourlyData.reduce((sum, h) => sum + h.count, 0);

    return NextResponse.json({
      hourly: hourlyData,
      peakHours,
      silentHours,
      maxCount,
      totalTweets,
    } as HourlyStatsResponse);
  } catch (error) {
    console.error('Hourly stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get hourly stats', details: String(error) },
      { status: 500 }
    );
  }
}
