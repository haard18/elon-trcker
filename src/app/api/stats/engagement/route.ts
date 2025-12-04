import { NextResponse } from 'next/server';
import { getTweetsCollection } from '@/lib/mongodb';
import { EngagementMetricsResponse } from '@/lib/types';

export async function GET() {
  try {
    const collection = await getTweetsCollection();

    // Get all tweets (excluding replies)
    const allTweets = await collection.find({ isReply: { $ne: true } }).toArray();
    const totalTweets = allTweets.length;

    if (totalTweets === 0) {
      return NextResponse.json({
        averageTweetsPerDay: 0,
        medianTweetsPerDay: 0,
        standardDeviation: 0,
        minTweetsPerDay: 0,
        maxTweetsPerDay: 0,
        p25TweetsPerDay: 0,
        p75TweetsPerDay: 0,
        totalTweetsAllTime: 0,
        daysWithTweets: 0,
        totalDaysTracked: 0,
        consistencyScore: 0,
        mostActiveDayOfWeek: 'N/A',
        mostActiveHour: 'N/A',
        tweetingFrequency: 'sparse',
        lastCalculated: new Date().toISOString(),
      } as EngagementMetricsResponse);
    }

    // Get date range
    const sortedTweets = allTweets.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const firstTweet = sortedTweets[0];
    const lastTweet = sortedTweets[sortedTweets.length - 1];

    const firstDate = new Date(firstTweet.created_at);
    const lastDate = new Date(lastTweet.created_at);

    const daysDiff = Math.floor(
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    // Count tweets per day
    const tweetsPerDay: Map<string, number> = new Map();
    allTweets.forEach((tweet) => {
      const date = new Date(tweet.created_at).toISOString().split('T')[0];
      tweetsPerDay.set(date, (tweetsPerDay.get(date) || 0) + 1);
    });

    const dailyCounts = Array.from(tweetsPerDay.values());
    const daysWithTweets = dailyCounts.length;

    // Calculate statistical measures
    const averagePerDay = totalTweets / daysDiff;
    
    // Median
    const sortedCounts = [...dailyCounts].sort((a, b) => a - b);
    const medianTweetsPerDay = sortedCounts.length % 2 === 0
      ? (sortedCounts[sortedCounts.length / 2 - 1] + sortedCounts[sortedCounts.length / 2]) / 2
      : sortedCounts[Math.floor(sortedCounts.length / 2)];

    // Standard deviation
    const variance = dailyCounts.reduce((sum, count) => sum + Math.pow(count - averagePerDay, 2), 0) / dailyCounts.length;
    const standardDeviation = Math.sqrt(variance);

    // Min and Max
    const minTweetsPerDay = Math.min(...dailyCounts);
    const maxTweetsPerDay = Math.max(...dailyCounts);

    // Percentiles
    const getPercentile = (values: number[], p: number): number => {
      const sorted = [...values].sort((a, b) => a - b);
      const index = (p / 100) * (sorted.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index % 1;

      if (lower === upper) {
        return sorted[lower];
      }
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    };

    const p25TweetsPerDay = getPercentile(dailyCounts, 25);
    const p75TweetsPerDay = getPercentile(dailyCounts, 75);

    // Calculate consistency score (0-100)
    const consistencyScore = Math.round((daysWithTweets / daysDiff) * 100);

    // Find most active day of week
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
    allTweets.forEach((tweet) => {
      const dayOfWeek = new Date(tweet.created_at).getUTCDay();
      weekdayCounts[dayOfWeek]++;
    });
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mostActiveDayOfWeekIndex = weekdayCounts.indexOf(Math.max(...weekdayCounts));
    const mostActiveDayOfWeek = weekdayNames[mostActiveDayOfWeekIndex];

    // Find most active hour
    const hourCounts = Array(24).fill(0);
    allTweets.forEach((tweet) => {
      const hour = new Date(tweet.created_at).getUTCHours();
      hourCounts[hour]++;
    });
    const mostActiveHourIndex = hourCounts.indexOf(Math.max(...hourCounts));
    const mostActiveHour = `${String(mostActiveHourIndex).padStart(2, '0')}:00`;

    // Determine tweeting frequency
    let tweetingFrequency: 'sparse' | 'moderate' | 'frequent' | 'very_frequent';
    if (averagePerDay < 1) tweetingFrequency = 'sparse';
    else if (averagePerDay < 5) tweetingFrequency = 'moderate';
    else if (averagePerDay < 20) tweetingFrequency = 'frequent';
    else tweetingFrequency = 'very_frequent';

    return NextResponse.json({
      averageTweetsPerDay: Math.round(averagePerDay * 100) / 100,
      medianTweetsPerDay: Math.round(medianTweetsPerDay * 100) / 100,
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      minTweetsPerDay,
      maxTweetsPerDay,
      p25TweetsPerDay: Math.round(p25TweetsPerDay * 100) / 100,
      p75TweetsPerDay: Math.round(p75TweetsPerDay * 100) / 100,
      totalTweetsAllTime: totalTweets,
      daysWithTweets,
      totalDaysTracked: daysDiff,
      consistencyScore,
      mostActiveDayOfWeek,
      mostActiveHour,
      tweetingFrequency,
      lastCalculated: new Date().toISOString(),
    } as EngagementMetricsResponse);
  } catch (error) {
    console.error('Engagement metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to get engagement metrics', details: String(error) },
      { status: 500 }
    );
  }
}
