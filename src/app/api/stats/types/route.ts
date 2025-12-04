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
 * Classify tweet based on API metadata
 * For this market: count only main posts (not replies), quote posts, and reposts
 */
function classifyTweet(tweet: any): {
  isReply: boolean;
  isRetweet: boolean;
  isQuote: boolean;
  hasMedia: boolean;
  isCounted: boolean; // true if it's a main post, quote, or repost
} {
  const isReply = !!tweet.isReply;  // Uses metadata from API
  const isRetweet = !!tweet.isRetweet;  // Uses metadata from API
  const isQuote = !!tweet.isQuote;  // Uses metadata from API
  const hasMedia = /pic\.twitter\.com|youtu\.be|imgur\.com|giphy\.com|vimeo\.com|vine\.co|twitpic\.com|imgur\.com/i.test(tweet.text);

  // For this market: only count main posts (not replies), quotes, and reposts
  const isCounted = !isReply && (isRetweet || isQuote || (!isRetweet && !isQuote));

  return {
    isReply,
    isRetweet,
    isQuote,
    hasMedia,
    isCounted,
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
      total: 0, // Only count tweets that should be counted (main posts, quotes, reposts)
    };

    // Classify tweets
    tweets.forEach((tweet: any) => {
      const classification = classifyTweet(tweet);

      // Count only tweets that are in scope: main posts (not replies), quotes, and reposts
      if (classification.isCounted) {
        stats.total++;

        // Priority: retweet > quote > media > text
        if (classification.isRetweet) {
          stats.retweets++;
        } else if (classification.isQuote) {
          stats.quotes++;
        } else if (classification.hasMedia) {
          stats.media++;
        } else {
          stats.text++;
        }
      }
      // Replies are NOT counted and NOT included in breakdown
    });

    // Calculate percentages - based on counted tweets only
    const total = stats.total || 1; // Avoid division by zero

    const percentages: TweetTypePercentages = {
      textPct: Math.round((stats.text / total) * 10000) / 100,
      repliesPct: 0, // Replies not counted
      quotesPct: Math.round((stats.quotes / total) * 10000) / 100,
      retweetsPct: Math.round((stats.retweets / total) * 10000) / 100,
      mediaPct: Math.round((stats.media / total) * 10000) / 100,
    };

    // Create breakdown array - only show counted types
    const breakdown = [
      { type: 'Plain Text', count: stats.text, percentage: percentages.textPct },
      { type: 'Quotes', count: stats.quotes, percentage: percentages.quotesPct },
      { type: 'Retweets', count: stats.retweets, percentage: percentages.retweetsPct },
      { type: 'Media', count: stats.media, percentage: percentages.mediaPct },
    ].filter(item => item.count > 0).sort((a, b) => b.count - a.count);

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
