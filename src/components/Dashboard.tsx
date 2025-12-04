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
  const [polling, setPolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['engagement', 'velocity']));

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
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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

  const toggleSection = (section: string) => {
    const newSections = new Set(expandedSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setExpandedSections(newSections);
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
      {/* HEADER SECTION */}
      <header className="mb-12 border-b-4 border-gray-700 pb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">
              ELON TRACKER
            </h1>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-bold text-gray-500">
                Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : '-'}
              </p>
              <p className="text-base font-bold text-yellow-400">
                Follow <a href="https://x.com/adiflips" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 underline">x.com/adiflips</a>
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={triggerPoll}
              disabled={polling}
              className="border-4 border-black bg-black px-8 py-3 text-white uppercase font-bold shadow-[4px_4px_0_#666] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50"
            >
              {polling ? 'Polling...' : 'Poll Now'}
            </button>
            <Link
              href="/feed"
              className="border-4 border-black bg-white px-8 py-3 text-black uppercase font-bold shadow-[4px_4px_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              Feed →
            </Link>
          </div>
        </div>
      </header>

      {/* KEY METRICS SECTION - Primary Focus */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-black text-white uppercase tracking-tight">Key Metrics</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Today Card - Largest */}
          <Card title="Today">
            <div className="space-y-4">
              <div className="text-7xl font-black text-black">{todayStats?.count ?? 0}</div>
              <div className="text-xs font-bold uppercase text-gray-600">Tweets Today</div>
              <div className="grid grid-cols-2 gap-4 border-t-4 border-black pt-4">
                <div>
                  <div className="text-xs font-bold uppercase text-gray-500">First</div>
                  <div className="text-lg font-bold text-black">
                    {formatTime(todayStats?.firstTweetTime ?? null)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-gray-500">Last</div>
                  <div className="text-lg font-bold text-black">
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
              <span className="text-4xl font-black text-black">
                {weekStats.reduce((sum, day) => sum + day.count, 0)}
              </span>
              <span className="ml-2 text-xs font-bold uppercase text-black">Total</span>
            </div>
          </Card>

          {/* This Month Card */}
          <Card title="This Month">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-black text-black">{monthStats?.totalTweets ?? 0}</div>
                  <div className="text-xs font-bold uppercase text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-black">{monthStats?.averagePerDay ?? 0}</div>
                  <div className="text-xs font-bold uppercase text-gray-500">Avg/Day</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-black">{monthStats?.zeroTweetDays ?? 0}</div>
                  <div className="text-xs font-bold uppercase text-gray-500">Zero Days</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ADVANCED ANALYTICS SECTION */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-black text-white uppercase tracking-tight">Advanced Analytics</h2>
        <div className="space-y-6">
          {/* Engagement Metrics - Collapsible */}
          {engagementStats && (
            <div className="border-2 border-black bg-white">
              <button
                onClick={() => toggleSection('engagement')}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-black text-black uppercase">Engagement & Consistency</h3>
                <span className={`text-2xl font-black transition-transform ${expandedSections.has('engagement') ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSections.has('engagement') && (
                <div className="border-t-2 border-black px-6 py-4">
                  <EngagementMetrics data={engagementStats} />
                </div>
              )}
            </div>
          )}

          {/* Velocity/Momentum - Collapsible */}
          {velocityStats && (
            <div className="border-2 border-black bg-white">
              <button
                onClick={() => toggleSection('velocity')}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-black text-black uppercase">Posting Velocity & Trends</h3>
                <span className={`text-2xl font-black transition-transform ${expandedSections.has('velocity') ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSections.has('velocity') && (
                <div className="border-t-2 border-black px-6 py-4">
                  <VelocityMetrics data={velocityStats} />
                </div>
              )}
            </div>
          )}

          {/* Response Time Analysis - Collapsible */}
          {responseTimeStats && (
            <div className="border-2 border-black bg-white">
              <button
                onClick={() => toggleSection('response-time')}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-black text-black uppercase">Response Time Analysis</h3>
                <span className={`text-2xl font-black transition-transform ${expandedSections.has('response-time') ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSections.has('response-time') && (
                <div className="border-t-2 border-black px-6 py-4">
                  <ResponseTimeMetrics data={responseTimeStats} />
                </div>
              )}
            </div>
          )}

          {/* Burst Detection - Collapsible */}
          {burstStats && (
            <div className="border-2 border-black bg-white">
              <button
                onClick={() => toggleSection('bursts')}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-black text-black uppercase">Burst Detection & Patterns</h3>
                <span className={`text-2xl font-black transition-transform ${expandedSections.has('bursts') ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSections.has('bursts') && (
                <div className="border-t-2 border-black px-6 py-4">
                  <BurstMetrics data={burstStats} />
                </div>
              )}
            </div>
          )}

          {/* Hourly Heatmap - Collapsible */}
          {hourlyStats && (
            <div className="border-2 border-black bg-white">
              <button
                onClick={() => toggleSection('heatmap')}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-black text-black uppercase">Time-of-Day Heatmap (24H)</h3>
                <span className={`text-2xl font-black transition-transform ${expandedSections.has('heatmap') ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSections.has('heatmap') && (
                <div className="border-t-2 border-black px-6 py-4 space-y-4">
                  <HourlyHeatmap
                    data={hourlyStats.hourly}
                    maxCount={hourlyStats.maxCount}
                    peakHours={hourlyStats.peakHours}
                  />
                  <div className="border-t-2 border-black pt-4 text-sm">
                    <p className="text-gray-700 font-semibold">
                      <span className="font-black text-black">Peak Hours:</span> {hourlyStats.peakHours.length > 0 ? hourlyStats.peakHours.map((h) => `${String(h).padStart(2, '0')}:00`).join(', ') : 'None'}
                    </p>
                    <p className="text-gray-700 font-semibold">
                      <span className="font-black text-black">Silent Hours:</span> {hourlyStats.silentHours.length > 0 ? hourlyStats.silentHours.map((h) => `${String(h).padStart(2, '0')}:00`).join(', ') : 'None'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Weekday Distribution - Collapsible */}
          {weekdayStats && (
            <div className="border-2 border-black bg-white">
              <button
                onClick={() => toggleSection('weekday')}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-black text-black uppercase">Day-of-Week Distribution</h3>
                <span className={`text-2xl font-black transition-transform ${expandedSections.has('weekday') ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSections.has('weekday') && (
                <div className="border-t-2 border-black px-6 py-4">
                  <WeekdayDistribution
                    data={weekdayStats.weekSummary}
                    topDay={weekdayStats.topDay}
                    topDayName={weekdayStats.topDayName}
                  />
                </div>
              )}
            </div>
          )}


        </div>
      </section>

      {/* DETAILED BREAKDOWN SECTION */}
      <section>
        <h2 className="mb-6 text-2xl font-black text-white uppercase tracking-tight">Daily Breakdown</h2>
        <Card title="This Month" className="overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b-4 border-black">
                  <th className="px-4 py-2 text-left text-black uppercase font-black">Date</th>
                  <th className="px-4 py-2 text-left text-black uppercase font-black">Day</th>
                  <th className="px-4 py-2 text-right text-black uppercase font-black">Tweets</th>
                </tr>
              </thead>
              <tbody>
                {monthStats?.tweetsPerDay.slice().reverse().map((day) => (
                  <tr key={day.date} className="border-b-2 border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-black font-bold">{day.date}</td>
                    <td className="px-4 py-2 font-bold text-black">
                      {new Date(day.date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className={`inline-block min-w-12 border-2 border-black px-2 py-1 text-center text-black font-bold ${day.count === 0 ? 'bg-gray-200' : 'bg-black text-white'}`}>
                        {day.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
