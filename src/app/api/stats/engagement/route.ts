import { NextResponse } from 'next/server';
import { getTweetsCollection } from '@/lib/mongodb';
import { EngagementMetricsResponse } from '@/lib/types';

export async function GET() {
  try {
    const collection = await getTweetsCollection();

    // Get all tweets
    const allTweets = await collection.find({}).toArray();
    const totalTweets = allTweets.length;

    if (totalTweets === 0) {
      return NextResponse.json({
        averageTweetsPerDay: 0,
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

    // Count days with tweets
    const uniqueDays = new Set<string>();
    allTweets.forEach((tweet) => {
      const date = new Date(tweet.created_at).toISOString().split('T')[0];
      uniqueDays.add(date);
    });
    const daysWithTweets = uniqueDays.size;

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
    const averagePerDay = totalTweets / daysDiff;
    let tweetingFrequency: 'sparse' | 'moderate' | 'frequent' | 'very_frequent';
    if (averagePerDay < 1) tweetingFrequency = 'sparse';
    else if (averagePerDay < 5) tweetingFrequency = 'moderate';
    else if (averagePerDay < 20) tweetingFrequency = 'frequent';
    else tweetingFrequency = 'very_frequent';

    return NextResponse.json({
      averageTweetsPerDay: Math.round(averagePerDay * 100) / 100,
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
