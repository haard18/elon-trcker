import { NextResponse } from 'next/server';
import { getTweetsCollection } from '@/lib/mongodb';
import { TwitterApiTweet } from '@/lib/types';
import { AnyBulkWriteOperation } from 'mongodb';

interface TweetDocument {
  _id: string;
  text: string;
  created_at: Date;
  isRetweet?: boolean;
  isQuote?: boolean;
  isReply?: boolean;
}

interface TwitterApiResponse {
  status?: string;
  code?: number;
  msg?: string;
  data?: {
    pin_tweet?: TwitterApiTweet | null;
    tweets: TwitterApiTweet[];
  };
  has_next_page?: boolean;
  next_cursor?: string;
  message?: string;
}

interface PollStateDocument {
  _id: string;
  lastPollTime: Date;
  lastTweetId?: string;
}

export async function GET() {
  try {
    const baseUrl =
      process.env.TWITTERIO_BASE ||
      'https://api.twitterapi.io/twitter/user/last_tweets';

    const apiKey = process.env.TWITTERIO_API_KEY;
    const userName = process.env.TWITTERIO_USERNAME || 'elonmusk';
    const includeReplies = process.env.TWITTERIO_INCLUDE_REPLIES === 'true';
    const maxTweetsPerPoll = parseInt(process.env.MAX_TWEETS_PER_POLL || '200', 10);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'TWITTERIO_API_KEY is not configured' },
        { status: 500 }
      );
    }

    if (!userName && !process.env.TWITTERIO_USER_ID) {
      return NextResponse.json(
        { error: 'Either TWITTERIO_USERNAME or TWITTERIO_USER_ID must be configured' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams();

    if (process.env.TWITTERIO_USER_ID) {
      params.set('userId', process.env.TWITTERIO_USER_ID);
    } else {
      params.set('userName', userName);
    }

    if (includeReplies) {
      params.set('includeReplies', 'true');
    }

    // Get collection for tracking state
    const collection = await getTweetsCollection();
    const db = collection.db;
    const pollStateCollection = db.collection<PollStateDocument>('poll_state');

    // Get last poll time and check if this is first poll
    const pollState = await pollStateCollection.findOne({ _id: 'last_poll' });
    const lastPollTime = pollState?.lastPollTime;
    const isFirstPoll = !lastPollTime;

    console.log('Last poll time:', lastPollTime);
    console.log('Is first poll (initial backfill):', isFirstPoll);

    // Fetch all tweets with pagination
    let allTweets: TwitterApiTweet[] = [];
    let nextCursor: string | undefined = undefined;
    let pagesProcessed = 0;
    // On first poll, fetch all pages until month start or no more data
    // On subsequent polls, fetch until time boundary crossed
    const maxPages = isFirstPoll ? 1000 : 5; // First poll: fetch all available, subsequent: up to 100
    let oldestTweetTime: Date | null = null; // Track oldest tweet found

    // On first poll, calculate the start of current month for cutoff
    let monthStartDate: Date | null = null;
    if (isFirstPoll) {
      const now = new Date();
      monthStartDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      console.log('First poll - will fetch until month start:', monthStartDate.toISOString());
    }

    console.log('Starting to fetch tweets with pagination... (maxPages=' + maxPages + ')');

    do {
      const currentParams = new URLSearchParams(params);
      if (nextCursor) {
        currentParams.set('cursor', nextCursor);
      }

      const url = `${baseUrl}?${currentParams.toString()}`;
      console.log(`Fetching page ${pagesProcessed + 1}, cursor:`, nextCursor || 'initial');

      const response = await fetch(url, {
        headers: {
          'X-API-Key': apiKey,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Twitter API HTTP error:', response.status, errorText);
        return NextResponse.json(
          {
            error: `Twitter API error: ${response.status}`,
            details: errorText,
          },
          { status: response.status }
        );
      }

      const data: TwitterApiResponse = await response.json();

      console.log('Page response:', {
        status: data.status,
        tweetsInPage: data.data?.tweets?.length,
        hasNextPage: data.has_next_page,
      });

      if (data.status && data.status !== 'success') {
        console.error('Twitter API returned non-success status:', data.status, data.msg);
        return NextResponse.json(
          {
            error: 'Twitter API returned non-success status',
            details: data,
          },
          { status: 502 }
        );
      }

      if (!data.data?.tweets || !Array.isArray(data.data.tweets)) {
        console.error(
          'Invalid response format - tweets array missing or invalid:',
          data
        );
        break;
      }

      const pageTweets = data.data.tweets;
      
      // On first poll, accept all tweets (initial backfill). On subsequent polls, only accept tweets newer than last poll
      let newTweets = pageTweets;
      if (lastPollTime) {
        newTweets = pageTweets.filter(tweet => new Date(tweet.createdAt) > lastPollTime);
      }

      // Track the oldest tweet we've seen
      if (pageTweets.length > 0) {
        const pageOldestTime = new Date(pageTweets[pageTweets.length - 1].createdAt);
        if (!oldestTweetTime || pageOldestTime < oldestTweetTime) {
          oldestTweetTime = pageOldestTime;
        }
      }

      allTweets.push(...newTweets);
      console.log(`Added ${newTweets.length} new tweets from this page (${pageTweets.length} total in page), oldest in page: ${pageTweets[pageTweets.length - 1]?.createdAt}`);

      // Check if we've reached month start (for first poll backfill)
      let reachedMonthStart = false;
      if (isFirstPoll && monthStartDate && oldestTweetTime) {
        reachedMonthStart = oldestTweetTime < monthStartDate;
        if (reachedMonthStart) {
          console.log('Reached month start boundary, stopping pagination');
        }
      }

      // Stop pagination if:
      // 1. No more pages available, OR
      // 2. We've hit the max pages limit, OR
      // 3. (First poll) We've reached the month start, OR
      // 4. (Subsequent polls) We're past the poll time boundary (found tweets older than last poll)
      if (!data.has_next_page || !data.next_cursor) {
        console.log('No more pages available, stopping pagination');
        nextCursor = undefined;
      } else if (pagesProcessed >= maxPages - 1) {
        console.log('Reached max pages limit, stopping pagination');
        nextCursor = undefined;
      } else if (isFirstPoll && reachedMonthStart) {
        console.log('Reached month start, stopping pagination');
        nextCursor = undefined;
      } else if (!isFirstPoll && lastPollTime && newTweets.length === 0 && pageTweets.length > 0) {
        // Only for subsequent polls: if we got tweets but none were newer than lastPollTime, we've crossed the time boundary
        console.log('Crossed poll time boundary - all tweets on this page are older than last poll, stopping pagination');
        nextCursor = undefined;
      } else {
        // Continue to next page
        nextCursor = data.next_cursor;
        pagesProcessed++;
        console.log('More pages available, continuing... (page ' + (pagesProcessed + 1) + ')');
      }
    } while (nextCursor && pagesProcessed < maxPages);

    console.log(`Pagination complete. Total new tweets: ${allTweets.length}`);

    // Classify tweets based on API metadata
    function classifyTweet(tweet: TwitterApiTweet): { isRetweet: boolean; isQuote: boolean; isReply: boolean } {
      const isReply = !!tweet.in_reply_to_status_id;  // Has a reply-to ID
      const isRetweet = !!tweet.retweeted_status;     // Is a retweet
      const isQuote = !!tweet.is_quote_status && !isRetweet;  // Is a quote (but not a retweet)
      
      return { isReply, isRetweet, isQuote };
    }

    const tweets = allTweets;

    if (tweets.length === 0) {
      console.log('Received empty tweets array');
      
      // Still update poll time even if no new tweets
      await pollStateCollection.updateOne(
        { _id: 'last_poll' },
        { $set: { lastPollTime: new Date() } },
        { upsert: true }
      );
      
      return NextResponse.json({
        success: true,
        fetched: 0,
        upserted: 0,
        modified: 0,
        timestamp: new Date().toISOString(),
        lastPollTime: lastPollTime?.toISOString(),
        pagesProcessed: pagesProcessed + 1,
      });
    }

    const operations: AnyBulkWriteOperation<TweetDocument>[] =
      tweets.map((tweet: TwitterApiTweet) => {
        const classification = classifyTweet(tweet);
        return {
          updateOne: {
            filter: { _id: tweet.id } as unknown as { _id: string },
            update: {
              $set: {
                _id: tweet.id,
                text: tweet.text,
                created_at: new Date(tweet.createdAt),
                isRetweet: classification.isRetweet,
                isQuote: classification.isQuote,
                isReply: classification.isReply,
              },
            },
            upsert: true,
          },
        };
      });

    let result = { upsertedCount: 0, modifiedCount: 0 };

    if (operations.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bulkResult = await collection.bulkWrite(operations as any);
      result = {
        upsertedCount: bulkResult.upsertedCount,
        modifiedCount: bulkResult.modifiedCount,
      };
    }

    console.log('Successfully processed tweets:', {
      fetched: tweets.length,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
    });

    // Update last poll time
    const now = new Date();
    await pollStateCollection.updateOne(
      { _id: 'last_poll' },
      { 
        $set: { 
          lastPollTime: now,
          lastTweetId: tweets[0]?.id
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      fetched: tweets.length,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      timestamp: now.toISOString(),
      lastPollTime: lastPollTime?.toISOString(),
      pagesProcessed: pagesProcessed + 1,
    });
  } catch (error) {
    console.error('Poll error:', error);
    return NextResponse.json(
      { error: 'Failed to poll tweets', details: String(error) },
      { status: 500 }
    );
  }
}
