'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import WeekChart from '@/components/WeekChart';
import { DayStats, TodayStats, MonthStats } from '@/lib/types';

interface MonthStatsResponse extends MonthStats {
  month: string;
}

interface TodayStatsResponse extends TodayStats {
  date: string;
}

export default function Dashboard() {
  const [todayStats, setTodayStats] = useState<TodayStatsResponse | null>(null);
  const [weekStats, setWeekStats] = useState<DayStats[]>([]);
  const [monthStats, setMonthStats] = useState<MonthStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const [todayRes, weekRes, monthRes] = await Promise.all([
        fetch('/api/stats/today'),
        fetch('/api/stats/7days'),
        fetch('/api/stats/month'),
      ]);

      const [today, week, month] = await Promise.all([
        todayRes.json(),
        weekRes.json(),
        monthRes.json(),
      ]);

      setTodayStats(today);
      setWeekStats(week);
      setMonthStats(month);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerPoll = async () => {
    setPolling(true);
    try {
      const res = await fetch('/api/poll');
      const data = await res.json();
      console.log('Poll result:', data);
      await fetchStats();
    } catch (error) {
      console.error('Poll failed:', error);
    } finally {
      setPolling(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchStats]);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
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
            ELON TRACKER
          </h1>
          <p className="text-sm font-bold text-gray-600">
            Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : '-'}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={triggerPoll}
            disabled={polling}
            className="border-4 border-black bg-black px-6 py-3 text-black uppercase text-white shadow-[4px_4px_0_#666] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50"
          >
            {polling ? 'Polling...' : 'Poll Now'}
          </button>
          <Link
            href="/feed"
            className="border-4 border-black bg-white px-6 py-3 text-black uppercase shadow-[4px_4px_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            Feed →
          </Link>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today Card */}
        <Card title="Today">
          <div className="space-y-4">
            <div className="text-6xl text-black">{todayStats?.count ?? 0}</div>
            <div className="text-sm font-bold uppercase text-gray-600">Tweets Today</div>
            <div className="grid grid-cols-2 gap-4 border-t-4 border-black pt-4">
              <div>
                <div className="text-xs font-bold uppercase text-gray-500">First</div>
                <div className="text-lg text-black">
                  {formatTime(todayStats?.firstTweetTime ?? null)}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-gray-500">Last</div>
                <div className="text-lg text-black">
                  {formatTime(todayStats?.lastTweetTime ?? null)}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Last 7 Days Card */}
        <Card title="Last 7 Days">
          <WeekChart data={weekStats} />
          <div className="mt-4 border-t-4 border-black pt-4 text-center">
            <span className="text-2xl text-black">
              {weekStats.reduce((sum, day) => sum + day.count, 0)}
            </span>
            <span className="ml-2 text-sm font-bold uppercase text-black">Total</span>
          </div>
        </Card>

        {/* This Month Card */}
        <Card title="This Month">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl text-black">{monthStats?.totalTweets ?? 0}</div>
                <div className="text-xs font-bold uppercase text-black ">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-black">{monthStats?.averagePerDay ?? 0}</div>
                <div className="text-xs font-bold uppercase text-gray-500">Avg/Day</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-black">{monthStats?.zeroTweetDays ?? 0}</div>
                <div className="text-xs font-bold uppercase text-gray-500">Zero Days</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="mt-8">
        <Card title="Daily Breakdown - This Month" className="overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b-4 border-black">
                  <th className="px-4 py-2 text-left text-black uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-black uppercase">Day</th>
                  <th className="px-4 py-2 text-right text-black uppercase">Tweets</th>
                </tr>
              </thead>
              <tbody>
                {monthStats?.tweetsPerDay.slice().reverse().map((day) => (
                  <tr key={day.date} className="border-b-2 border-gray-200">
                    <td className="px-4 py-2 font-mono text-black font-bold">{day.date}</td>
                    <td className="px-4 py-2 font-bold text-black">
                      {new Date(day.date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className={`inline-block min-w-[3rem] border-2 border-black px-2 py-1 text-center text-black ${day.count === 0 ? 'bg-gray-200' : 'bg-black text-white'}`}>
                        {day.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
