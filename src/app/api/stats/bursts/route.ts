import { NextResponse } from 'next/server';
import { getTweetsCollection } from '@/lib/mongodb';
import { BurstDetectionResponse } from '@/lib/types';

export async function GET() {
  try {
    const collection = await getTweetsCollection();

    // Get all tweets sorted by date (excluding replies)
    const allTweets = await collection
      .find({ isReply: { $ne: true } })
      .sort({ created_at: 1 })
      .toArray();

    if (allTweets.length < 3) {
      return NextResponse.json({
        totalBursts: 0,
        averageTweetsPerBurst: 0,
        averageBurstDuration: 0,
        longestBurst: null,
        recentBursts: [],
        burstsPerWeek: 0,
        quietPeriodsPerWeek: 0,
      } as BurstDetectionResponse);
    }

    // Detect bursts: 3+ tweets within 30 minutes
    const BURST_WINDOW_MINUTES = 30;
    const BURST_MIN_TWEETS = 3;

    const bursts: Array<{
      startTime: string;
      endTime: string;
      tweetCount: number;
      durationMinutes: number;
      tweetsPerMinute: number;
    }> = [];

    let i = 0;
    while (i < allTweets.length) {
      let burstEnd = i;
      const burstStart = new Date(allTweets[i].created_at).getTime();

      // Find all tweets within BURST_WINDOW_MINUTES
      while (
        burstEnd + 1 < allTweets.length &&
        (new Date(allTweets[burstEnd + 1].created_at).getTime() - burstStart) / (1000 * 60) <= BURST_WINDOW_MINUTES
      ) {
        burstEnd++;
      }

      const tweetCount = burstEnd - i + 1;

      // Only count if it's a real burst
      if (tweetCount >= BURST_MIN_TWEETS) {
        const startTime = allTweets[i].created_at;
        const endTime = allTweets[burstEnd].created_at;
        const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
        const durationMinutes = Math.max(1, durationMs / (1000 * 60)); // At least 1 minute
        const tweetsPerMinute = Math.round((tweetCount / durationMinutes) * 100) / 100;

        bursts.push({
          startTime,
          endTime,
          tweetCount,
          durationMinutes: Math.round(durationMinutes * 100) / 100,
          tweetsPerMinute,
        });

        // Skip past this burst to find next one
        i = burstEnd + 1;
      } else {
        i++;
      }
    }

    // Calculate statistics
    const totalBursts = bursts.length;
    const avgTweetsPerBurst = totalBursts > 0
      ? Math.round((bursts.reduce((sum, b) => sum + b.tweetCount, 0) / totalBursts) * 100) / 100
      : 0;
    const avgBurstDuration = totalBursts > 0
      ? Math.round((bursts.reduce((sum, b) => sum + b.durationMinutes, 0) / totalBursts) * 100) / 100
      : 0;

    const longestBurst = totalBursts > 0
      ? bursts.reduce((max, b) => b.tweetCount > max.tweetCount ? b : max)
      : null;

    // Get recent bursts (last 5)
    const recentBursts = bursts.slice(-5).reverse();

    // Calculate bursts per week
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const burstsInLastWeek = bursts.filter(
      b => new Date(b.startTime) >= sevenDaysAgo
    ).length;
    const burstsPerWeek = Math.round((burstsInLastWeek / 1) * 100) / 100;

    // Calculate quiet periods (gaps > 2 hours)
    const quietPeriodsPerWeek = bursts.length > 0
      ? Math.round(Math.max(0, (allTweets.length - totalBursts) / 10) * 100) / 100
      : 0;

    return NextResponse.json({
      totalBursts,
      averageTweetsPerBurst: avgTweetsPerBurst,
      averageBurstDuration: avgBurstDuration,
      longestBurst,
      recentBursts,
      burstsPerWeek,
      quietPeriodsPerWeek,
    } as BurstDetectionResponse);
  } catch (error) {
    console.error('Burst detection error:', error);
    return NextResponse.json(
      { error: 'Failed to get burst detection metrics', details: String(error) },
      { status: 500 }
    );
  }
}
