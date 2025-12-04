import { NextResponse } from 'next/server';
import { getTweetsCollection } from '@/lib/mongodb';

export interface TweetTypeStats {
  text: number;
  replies: number;
  quotes: number;
  retweets: number;
  media: number;
  total: number;
}

export interface TweetTypePercentages {
  textPct: number;
  repliesPct: number;
  quotesPct: number;
  retweetsPct: number;
  mediaPct: number;
}

export interface TweetTypesResponse {
  counts: TweetTypeStats;
  percentages: TweetTypePercentages;
  breakdown: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * Classify tweet based on text content
 * Since we only have text field, we use text patterns to classify
 */
function classifyTweet(text: string): {
  isReply: boolean;
  isRetweet: boolean;
  isQuote: boolean;
  hasMedia: boolean;
} {
  const isReply = /^@\w+/.test(text); // Starts with @mention
  const isRetweet = /^RT @\w+/.test(text); // Starts with RT @
  const isQuote = /https:\/\/t\.co\/\w+/g.test(text); // Contains shortened URL (quote/link)
  const hasMedia = /pic\.twitter\.com|youtu\.be|imgur\.com|giphy\.com|vimeo\.com|vine\.co|twitpic\.com|imgur\.com/i.test(text);

  return {
    isReply,
    isRetweet,
    isQuote,
    hasMedia,
  };
}

export async function GET() {
  try {
    const collection = await getTweetsCollection();

    // Get all tweets
    const tweets = await collection.find({}).toArray();

    const stats: TweetTypeStats = {
      text: 0,
      replies: 0,
      quotes: 0,
      retweets: 0,
      media: 0,
      total: tweets.length,
    };

    // Classify tweets
    tweets.forEach((tweet: any) => {
      const classification = classifyTweet(tweet.text);

      // A tweet can have multiple classifications
      // Priority: retweet > reply > quote > text/media
      if (classification.isRetweet) {
        stats.retweets++;
      } else if (classification.isReply) {
        stats.replies++;
      } else if (classification.isQuote) {
        stats.quotes++;
      } else if (classification.hasMedia) {
        stats.media++;
      } else {
        stats.text++;
      }
    });

    // Calculate percentages
    const total = stats.total || 1; // Avoid division by zero

    const percentages: TweetTypePercentages = {
      textPct: Math.round((stats.text / total) * 10000) / 100,
      repliesPct: Math.round((stats.replies / total) * 10000) / 100,
      quotesPct: Math.round((stats.quotes / total) * 10000) / 100,
      retweetsPct: Math.round((stats.retweets / total) * 10000) / 100,
      mediaPct: Math.round((stats.media / total) * 10000) / 100,
    };

    // Create breakdown array
    const breakdown = [
      { type: 'Plain Text', count: stats.text, percentage: percentages.textPct },
      { type: 'Replies', count: stats.replies, percentage: percentages.repliesPct },
      { type: 'Quotes', count: stats.quotes, percentage: percentages.quotesPct },
      { type: 'Retweets', count: stats.retweets, percentage: percentages.retweetsPct },
      { type: 'Media', count: stats.media, percentage: percentages.mediaPct },
    ].sort((a, b) => b.count - a.count);

    return NextResponse.json({
      counts: stats,
      percentages,
      breakdown,
    } as TweetTypesResponse);
  } catch (error) {
    console.error('Tweet types stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get tweet types stats', details: String(error) },
      { status: 500 }
    );
  }
}
