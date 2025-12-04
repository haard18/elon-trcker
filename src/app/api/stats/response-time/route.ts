import { NextResponse } from 'next/server';
import { getTweetsCollection } from '@/lib/mongodb';
import { ResponseTimeResponse } from '@/lib/types';

export async function GET() {
  try {
    const collection = await getTweetsCollection();

    // Get all tweets sorted by date
    const allTweets = await collection
      .find({})
      .sort({ created_at: 1 })
      .toArray();

    if (allTweets.length < 2) {
      return NextResponse.json({
        averageMinutesBetweenTweets: 0,
        medianMinutesBetweenTweets: 0,
        minMinutesBetweenTweets: 0,
        maxMinutesBetweenTweets: 0,
        responsiveness: 'very_slow',
        totalTweets: allTweets.length,
        periodAnalyzed: 'N/A',
      } as ResponseTimeResponse);
    }

    // Calculate time between consecutive tweets in minutes
    const intervals: number[] = [];

    for (let i = 1; i < allTweets.length; i++) {
      const prevTime = new Date(allTweets[i - 1].created_at).getTime();
      const currTime = new Date(allTweets[i].created_at).getTime();
      const minutesBetween = (currTime - prevTime) / (1000 * 60);
      intervals.push(minutesBetween);
    }

    // Calculate statistics
    const average = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const sorted = [...intervals].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    const min = Math.min(...intervals);
    const max = Math.max(...intervals);

    // Determine responsiveness level
    let responsiveness: 'very_slow' | 'slow' | 'moderate' | 'fast' | 'very_fast';
    if (average > 1440) responsiveness = 'very_slow'; // > 1 day
    else if (average > 240) responsiveness = 'slow'; // > 4 hours
    else if (average > 60) responsiveness = 'moderate'; // > 1 hour
    else if (average > 15) responsiveness = 'fast'; // > 15 minutes
    else responsiveness = 'very_fast'; // < 15 minutes

    const firstTweet = new Date(allTweets[0].created_at).toLocaleDateString();
    const lastTweet = new Date(allTweets[allTweets.length - 1].created_at).toLocaleDateString();

    return NextResponse.json({
      averageMinutesBetweenTweets: Math.round(average * 100) / 100,
      medianMinutesBetweenTweets: Math.round(median * 100) / 100,
      minMinutesBetweenTweets: Math.round(min * 100) / 100,
      maxMinutesBetweenTweets: Math.round(max * 100) / 100,
      responsiveness,
      totalTweets: allTweets.length,
      periodAnalyzed: `${firstTweet} to ${lastTweet}`,
    } as ResponseTimeResponse);
  } catch (error) {
    console.error('Response time metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to get response time metrics', details: String(error) },
      { status: 500 }
    );
  }
}
