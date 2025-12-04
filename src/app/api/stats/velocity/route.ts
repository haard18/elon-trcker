import { NextResponse } from 'next/server';
import { getTweetsCollection } from '@/lib/mongodb';
import { VelocityResponse } from '@/lib/types';

export async function GET() {
  try {
    const collection = await getTweetsCollection();
    const now = new Date();

    // Helper to get tweets in last N days
    const getTweetsInDays = async (days: number) => {
      const startDate = new Date(now);
      startDate.setUTCDate(startDate.getUTCDate() - days);
      return await collection
        .find({
          created_at: { $gte: startDate },
        })
        .toArray();
    };

    // Get tweets for different periods
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayTweets = await collection
      .find({
        created_at: { $gte: todayStart },
      })
      .toArray();

    const sevenDaysTweets = await getTweetsInDays(7);
    const thirtyDaysTweets = await getTweetsInDays(30);

    // Calculate metrics for today
    const hoursInToday = (now.getTime() - todayStart.getTime()) / (1000 * 60 * 60) || 1;
    const todayTweetsPerHour = Math.round((todayTweets.length / Math.max(hoursInToday, 1)) * 100) / 100;
    const todayTweetsPerDay = todayTweets.length;

    // Calculate metrics for 7 days
    const sevenDaysTweetsPerDay = Math.round((sevenDaysTweets.length / 7) * 100) / 100;
    const sevenDaysTweetsPerHour = Math.round((sevenDaysTweets.length / (7 * 24)) * 100) / 100;

    // Calculate metrics for 30 days
    const thirtyDaysTweetsPerDay = Math.round((thirtyDaysTweets.length / 30) * 100) / 100;
    const thirtyDaysTweetsPerHour = Math.round((thirtyDaysTweets.length / (30 * 24)) * 100) / 100;

    // Determine trends by comparing 7-day average with 30-day average
    const calculateTrend = (recent: number, overall: number): {
      trend: 'increasing' | 'stable' | 'decreasing';
      percentage: number;
    } => {
      if (overall === 0) return { trend: 'stable', percentage: 0 };
      const diff = recent - overall;
      const percentage = Math.round((Math.abs(diff) / overall) * 100);

      if (percentage < 5) return { trend: 'stable', percentage: 0 };
      if (diff > 0) return { trend: 'increasing', percentage };
      return { trend: 'decreasing', percentage };
    };

    const trendData = calculateTrend(sevenDaysTweetsPerDay, thirtyDaysTweetsPerDay);

    return NextResponse.json({
      today: {
        period: 'today',
        tweetsPerHour: todayTweetsPerHour,
        tweetsPerDay: todayTweetsPerDay,
        trend: 'stable',
        trendPercentage: 0,
      },
      sevenDays: {
        period: '7days',
        tweetsPerHour: sevenDaysTweetsPerHour,
        tweetsPerDay: sevenDaysTweetsPerDay,
        trend: trendData.trend,
        trendPercentage: trendData.percentage,
      },
      thirtyDays: {
        period: '30days',
        tweetsPerHour: thirtyDaysTweetsPerHour,
        tweetsPerDay: thirtyDaysTweetsPerDay,
        trend: 'stable',
        trendPercentage: 0,
      },
    } as VelocityResponse);
  } catch (error) {
    console.error('Velocity metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to get velocity metrics', details: String(error) },
      { status: 500 }
    );
  }
}
