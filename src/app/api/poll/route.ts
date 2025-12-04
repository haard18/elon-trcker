import { NextResponse } from 'next/server';
import { getTweetsCollection } from '@/lib/mongodb';
import { TwitterApiTweet } from '@/lib/types';
import { AnyBulkWriteOperation } from 'mongodb';

interface TweetDocument {
  _id: string;
  text: string;
  created_at: Date;
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

    // Get last poll time
    const pollState = await pollStateCollection.findOne({ _id: 'last_poll' });
    const lastPollTime = pollState?.lastPollTime;

    console.log('Last poll time:', lastPollTime);

    // Fetch all tweets with pagination
    let allTweets: TwitterApiTweet[] = [];
    let nextCursor: string | undefined = undefined;
    let pagesProcessed = 0;
    const maxPages = 10; // Prevent infinite loops

    console.log('Starting to fetch tweets with pagination...');

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
      
      // Filter tweets newer than last poll if we have a last poll time
      const newTweets = lastPollTime
        ? pageTweets.filter(tweet => new Date(tweet.createdAt) > lastPollTime)
        : pageTweets;

      allTweets.push(...newTweets);
      console.log(`Added ${newTweets.length} new tweets from this page (${pageTweets.length} total in page)`);

      // If we found tweets older than our last poll, we can stop
      if (lastPollTime && newTweets.length < pageTweets.length) {
        console.log('Reached tweets older than last poll, stopping pagination');
        break;
      }

      // Check pagination
      if (data.has_next_page && data.next_cursor && allTweets.length < maxTweetsPerPoll) {
        nextCursor = data.next_cursor;
        pagesProcessed++;
      } else {
        nextCursor = undefined;
      }
    } while (nextCursor && pagesProcessed < maxPages);

    console.log(`Pagination complete. Total new tweets: ${allTweets.length}`);

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
      tweets.map((tweet: TwitterApiTweet) => ({
        updateOne: {
          filter: { _id: tweet.id } as unknown as { _id: string },
          update: {
            $set: {
              _id: tweet.id,
              text: tweet.text,
              created_at: new Date(tweet.createdAt),
            },
          },
          upsert: true,
        },
      }));

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
