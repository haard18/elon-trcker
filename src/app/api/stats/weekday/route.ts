import { NextResponse } from 'next/server';
import { getTweetsCollection } from '@/lib/mongodb';

export interface WeekdayStats {
  weekday: number; // 0=Sunday, 6=Saturday
  count: number;
  average: number;
}

export interface WeekdayStatsResponse {
  weekSummary: WeekdayStats[];
  topDay: number;
  topDayName: string;
  totalTweets: number;
  averagePerDay: number;
}

export async function GET() {
  try {
    const collection = await getTweetsCollection();

    // Initialize array with 7 weekdays (0=Sunday, 6=Saturday)
    const weekdayData: WeekdayStats[] = Array.from({ length: 7 }, (_, i) => ({
      weekday: i,
      count: 0,
      average: 0,
    }));

    // Aggregate tweets by weekday
    const results = await collection
      .aggregate([
        {
          $group: {
            _id: {
              $dayOfWeek: '$created_at',
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    // Map aggregation results to weekday data
    // MongoDB's $dayOfWeek returns 1=Sunday, 2=Monday, ..., 7=Saturday
    // We need to convert to 0=Sunday, 1=Monday, ..., 6=Saturday
    results.forEach((result: any) => {
      const mongoWeekday = result._id;
      const weekday = mongoWeekday === 1 ? 0 : mongoWeekday - 1; // Convert MongoDB format
      if (weekday >= 0 && weekday < 7) {
        weekdayData[weekday].count = result.count;
      }
    });

    // Calculate statistics
    const totalTweets = weekdayData.reduce((sum, d) => sum + d.count, 0);
    const averagePerDay = weekdayData.length > 0 ? Math.round((totalTweets / weekdayData.length) * 100) / 100 : 0;

    // Calculate average per day for the period
    // Note: This is a simple average - in production you might want to calculate average per week
    weekdayData.forEach((day) => {
      day.average = day.count > 0 ? Math.round((day.count / Math.max(1, totalTweets / weekdayData.length)) * 100) / 100 : 0;
    });

    // Find top day
    const topDayIndex = weekdayData.reduce((maxIdx, d, idx) => {
      return d.count > weekdayData[maxIdx].count ? idx : maxIdx;
    }, 0);

    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const topDayName = weekdayNames[topDayIndex];

    return NextResponse.json({
      weekSummary: weekdayData,
      topDay: topDayIndex,
      topDayName,
      totalTweets,
      averagePerDay,
    } as WeekdayStatsResponse);
  } catch (error) {
    console.error('Weekday stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get weekday stats', details: String(error) },
      { status: 500 }
    );
  }
}
