import { NextResponse } from 'next/server';
import { getTweetsCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const collection = await getTweetsCollection();
    
    // Get start and end of today in UTC
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    // Get tweets from today (excluding replies)
    const todaysTweets = await collection
      .find({
        created_at: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
        isReply: { $ne: true }, // Exclude replies
      })
      .sort({ created_at: 1 })
      .toArray();

    const count = todaysTweets.length;
    
    let firstTweetTime: string | null = null;
    let lastTweetTime: string | null = null;

    if (count > 0) {
      firstTweetTime = todaysTweets[0].created_at.toISOString();
      lastTweetTime = todaysTweets[count - 1].created_at.toISOString();
    }

    return NextResponse.json({
      count,
      firstTweetTime,
      lastTweetTime,
      date: startOfDay.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Today stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get today stats', details: String(error) },
      { status: 500 }
    );
  }
}
