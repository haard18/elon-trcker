import { NextResponse } from 'next/server';
import { getTweetsCollection } from '@/lib/mongodb';
import { DayStats, MonthStats } from '@/lib/types';

export async function GET() {
  try {
    const collection = await getTweetsCollection();
    
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    
    // Get days in current month up to today
    const daysInMonth = now.getUTCDate();
    const tweetsPerDay: DayStats[] = [];
    let totalTweets = 0;
    let zeroTweetDays = 0;
    
    // Count only non-reply tweets for this month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day));
      const nextDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day + 1));
      
      const count = await collection.countDocuments({
        created_at: {
          $gte: date,
          $lt: nextDate,
        },
        isReply: { $ne: true }, // Exclude replies
      });
      
      tweetsPerDay.push({
        date: date.toISOString().split('T')[0],
        count,
      });
      
      totalTweets += count;
      if (count === 0) {
        zeroTweetDays++;
      }
    }
    
    const averagePerDay = daysInMonth > 0 ? Math.round((totalTweets / daysInMonth) * 100) / 100 : 0;

    const result: MonthStats = {
      totalTweets,
      averagePerDay,
      zeroTweetDays,
      tweetsPerDay,
    };

    return NextResponse.json({
      ...result,
      month: startOfMonth.toISOString().substring(0, 7),
    });
  } catch (error) {
    console.error('Month stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get month stats', details: String(error) },
      { status: 500 }
    );
  }
}
