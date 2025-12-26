'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import WeekChart from '@/components/WeekChart';
import HourlyHeatmap from '@/components/HourlyHeatmap';
import WeekdayDistribution from '@/components/WeekdayDistribution';
import TypeBreakdown from '@/components/TypeBreakdown';
import EngagementMetrics from '@/components/EngagementMetrics';
import VelocityMetrics from '@/components/VelocityMetrics';
import ResponseTimeMetrics from '@/components/ResponseTimeMetrics';
import BurstMetrics from '@/components/BurstMetrics';
import {
  DayStats,
  TodayStats,
  MonthStats,
  HourlyStatsResponse,
  WeekdayStatsResponse,
  TweetTypesResponse,
  EngagementMetricsResponse,
  VelocityResponse,
  ResponseTimeResponse,
  BurstDetectionResponse,
} from '@/lib/types';

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
  const [hourlyStats, setHourlyStats] = useState<HourlyStatsResponse | null>(null);
  const [weekdayStats, setWeekdayStats] = useState<WeekdayStatsResponse | null>(null);
  const [typeStats, setTypeStats] = useState<TweetTypesResponse | null>(null);
  const [engagementStats, setEngagementStats] = useState<EngagementMetricsResponse | null>(null);
  const [velocityStats, setVelocityStats] = useState<VelocityResponse | null>(null);
  const [responseTimeStats, setResponseTimeStats] = useState<ResponseTimeResponse | null>(null);
  const [burstStats, setBurstStats] = useState<BurstDetectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [serverLastPoll, setServerLastPoll] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      // Fetch critical metrics first (blocks loading screen)
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
      setLoading(false);
      setLastUpdate(new Date());

      // Fetch advanced analytics in background (non-blocking)
      const [hourlyRes, weekdayRes, typeRes, engagementRes, velocityRes, responseTimeRes, burstsRes] = await Promise.all([
        fetch('/api/stats/hourly'),
        fetch('/api/stats/weekday'),
        fetch('/api/stats/types'),
        fetch('/api/stats/engagement'),
        fetch('/api/stats/velocity'),
        fetch('/api/stats/response-time'),
        fetch('/api/stats/bursts'),
      ]);

      const [hourly, weekday, type, engagement, velocity, responseTime, bursts] = await Promise.all([
        hourlyRes.json(),
        weekdayRes.json(),
        typeRes.json(),
        engagementRes.json(),
        velocityRes.json(),
        responseTimeRes.json(),
        burstsRes.json(),
      ]);

      setHourlyStats(hourly);
      setWeekdayStats(weekday);
      setTypeStats(type);
      setEngagementStats(engagement);
      setVelocityStats(velocity);
      setResponseTimeStats(responseTime);
      setBurstStats(bursts);

      // Fetch server poll state (last poll time)
      try {
        const pollRes = await fetch('/api/stats/poll');
        if (pollRes.ok) {
          const pollJson = await pollRes.json();
          if (pollJson.lastPollTime) setServerLastPoll(pollJson.lastPollTime);
        }
      } catch (err) {
        // ignore poll state errors
        console.debug('Failed to fetch poll state', err);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Set up polling interval (refresh every hour)
    const interval = setInterval(fetchStats, 3600000); // 60 minutes in milliseconds
    
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent mb-4"></div>
          <div className="text-sm text-gray-600">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* HEADER SECTION */}
<header className="mb-10 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 shadow-sm">
  <div className="px-6 py-6 md:px-8">
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      
      {/* Left */}
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Elon Musk Analytics
        </h1>

        {/* Attribution */}
        <div className="mt-2 flex items-center gap-3">
          <a
            href="https://x.com/adiflips"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3"
          >
            <div className="relative w-9 h-9">
              <img
                src="image.png"
                alt="Adiflips"
                className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full ring-2 ring-white"></span>
            </div>

            <span className="text-sm text-gray-600 italic group-hover:text-gray-800 transition-colors">
              Turning chaotic tweets into actionable signals (yes, really).
              <span className="ml-1 font-medium not-italic text-gray-900">
                x.com/adiflips
              </span>
            </span>
          </a>
        </div>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
          <span>
            Last refreshed:
            <span className="ml-1 font-medium text-gray-700">
              {lastUpdate ? lastUpdate.toLocaleTimeString() : '-'}
            </span>
          </span>

          <span className="text-gray-400">
            Server poll:
            <span className="ml-1">
              {serverLastPoll ? new Date(serverLastPoll).toLocaleString() : '-'}
            </span>
          </span>

          <span className="inline-flex items-center gap-2 font-medium text-gray-600">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
            </span>
            Auto-polling hourly
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex gap-3">
        <Link
          href="/feed"
          className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 hover:shadow-sm transition-all"
        >
          View Feed
        </Link>
      </div>
    </div>
  </div>
</header>


      {/* KEY METRICS SECTION */}
      <section className="mb-8">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Today Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-2">Today</div>
            <div className="text-4xl font-bold text-gray-900 mb-4">{todayStats?.count ?? 0}</div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>First: {formatTime(todayStats?.firstTweetTime ?? null)}</span>
              <span>Last: {formatTime(todayStats?.lastTweetTime ?? null)}</span>
            </div>
          </div>

          {/* Last 7 Days Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-2">Last 7 Days</div>
            <div className="text-4xl font-bold text-gray-900 mb-4">
              {weekStats.reduce((sum, day) => sum + day.count, 0)}
            </div>
            <WeekChart data={weekStats} />
          </div>

          {/* This Month Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-2">This Month</div>
            <div className="text-4xl font-bold text-gray-900 mb-4">{monthStats?.totalTweets ?? 0}</div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Avg/Day: {monthStats?.averagePerDay ?? 0}</span>
              <span>Zero Days: {monthStats?.zeroTweetDays ?? 0}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ANALYTICS SECTION */}
      <section className="mb-8">
        <div className="space-y-4">
          {/* Engagement Metrics */}
          {engagementStats && (
            <details className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-900">Engagement Metrics</h3>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 py-4 border-t border-gray-200">
                <EngagementMetrics data={engagementStats} />
              </div>
            </details>
          )}

          {/* Velocity Metrics */}
          {velocityStats && (
            <details className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-900">Posting Velocity</h3>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 py-4 border-t border-gray-200">
                <VelocityMetrics data={velocityStats} />
              </div>
            </details>
          )}

          {/* Response Time */}
          {responseTimeStats && (
            <details className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-900">Response Time Analysis</h3>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 py-4 border-t border-gray-200">
                <ResponseTimeMetrics data={responseTimeStats} />
              </div>
            </details>
          )}

          {/* Burst Detection */}
          {burstStats && (
            <details className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-900">Burst Patterns</h3>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 py-4 border-t border-gray-200">
                <BurstMetrics data={burstStats} />
              </div>
            </details>
          )}

          {/* Hourly Heatmap */}
          {hourlyStats && (
            <details className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-900">Hourly Activity Heatmap</h3>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 py-4 border-t border-gray-200">
                <HourlyHeatmap
                  data={hourlyStats.hourly}
                  maxCount={hourlyStats.maxCount}
                  peakHours={hourlyStats.peakHours}
                />
                <div className="mt-4 pt-4 border-t border-gray-200 text-sm space-y-1">
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">Peak:</span> {hourlyStats.peakHours.length > 0 ? hourlyStats.peakHours.map((h) => `${String(h).padStart(2, '0')}:00`).join(', ') : 'None'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">Silent:</span> {hourlyStats.silentHours.length > 0 ? hourlyStats.silentHours.map((h) => `${String(h).padStart(2, '0')}:00`).join(', ') : 'None'}
                  </p>
                </div>
              </div>
            </details>
          )}

          {/* Weekday Distribution */}
          {weekdayStats && (
            <details className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-900">Weekly Distribution</h3>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 py-4 border-t border-gray-200">
                <WeekdayDistribution
                  data={weekdayStats.weekSummary}
                  topDay={weekdayStats.topDay}
                  topDayName={weekdayStats.topDayName}
                />
              </div>
            </details>
          )}
        </div>
      </section>

      {/* DAILY BREAKDOWN SECTION */}
      <section>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Daily Breakdown</h2>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tweets</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthStats?.tweetsPerDay.slice().reverse().map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm font-mono text-gray-900">{day.date}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {new Date(day.date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className={`inline-flex items-center justify-center min-w-[3rem] px-3 py-1 text-sm font-semibold rounded-md ${
                        day.count === 0 ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {day.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}