'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import { Tweet } from '@/lib/types';

export default function FeedPage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchTweets = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch('/api/tweets/recent');
      const data = await res.json();
      setTweets(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch tweets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchTweets(false), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTweets]);

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'just now';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_#000]">
          <div className="text-2xl text-black uppercase">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl text-white uppercase tracking-tighter md:text-5xl">
            LIVE FEED
          </h1>
          <p className="text-sm font-bold text-gray-600">
            Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : '-'}
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => fetchTweets(true)}
            disabled={refreshing}
            className="border-4 border-black bg-black px-6 py-3 text-black uppercase text-white shadow-[4px_4px_0_#666] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`border-4 border-black px-6 py-3 text-black uppercase shadow-[4px_4px_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${autoRefresh ? 'bg-black text-white' : 'bg-white text-black'}`}
          >
            Auto: {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <Link
            href="/"
            className="border-4 border-black bg-white px-6 py-3 text-black uppercase shadow-[4px_4px_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <Card title={`Recent Tweets (${tweets.length})`}>
        <div className="space-y-4">
          {tweets.length === 0 ? (
            <div className="py-8 text-center font-black">
              <p className="text-lg font-bold">No tweets yet</p>
              <p className="text-sm">Click the Poll button on the dashboard to fetch tweets</p>
            </div>
          ) : (
            tweets.map((tweet) => (
              <div
                key={tweet._id}
                className="border-4 border-black p-4 transition-all hover:shadow-[4px_4px_0_#000]"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs text-black">
                    {tweet._id}
                  </span>
                  <span className="border-2 border-black bg-gray-100 text-black px-2 py-1 text-xs font-bold">
                    {formatRelativeTime(tweet.created_at.toString())}
                  </span>
                </div>
                <p className="text-lg leading-relaxed text-black">{tweet.text}</p>
                <div className="mt-2 text-xs text-black">
                  {new Date(tweet.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
