'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent mb-4"></div>
          <div className="text-sm text-gray-600">Loading tweets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <header className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">LIVE FEED</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
              <span>Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : '-'}</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchTweets(true)}
              disabled={refreshing}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-5 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${autoRefresh ? 'bg-white text-gray-700' : 'bg-white text-gray-700'}`}
            >
              Auto: {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <Link
              href="/"
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="mb-4 border-b border-gray-100 pb-2">
            <h2 className="text-base font-semibold text-gray-900">Recent Tweets ({tweets.length})</h2>
          </div>

          <div className="space-y-4">
            {tweets.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-lg font-semibold text-gray-700">No tweets yet</p>
                <p className="text-sm text-gray-500">Click the Poll button on the dashboard to fetch tweets</p>
              </div>
            ) : (
              tweets.map((tweet) => (
                <div key={tweet._id} className="border-b border-gray-100 py-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-500">{tweet._id}</span>
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                      {formatRelativeTime(tweet.created_at.toString())}
                    </span>
                  </div>
                  <p className="text-gray-900 text-lg leading-relaxed">{tweet.text}</p>
                  <div className="mt-2 text-xs text-gray-500">{new Date(tweet.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
