'use client';

import { motion } from 'framer-motion';
import { VelocityResponse } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface VelocityMetricsProps {
  data: VelocityResponse;
}

export default function VelocityMetrics({ data }: VelocityMetricsProps) {
  const chartData = [
    {
      period: 'Today',
      perDay: data.today.tweetsPerDay,
      perHour: Math.round(data.today.tweetsPerHour * 100) / 100,
    },
    {
      period: '7 Days Avg',
      perDay: Math.round(data.sevenDays.tweetsPerDay * 100) / 100,
      perHour: Math.round(data.sevenDays.tweetsPerHour * 100) / 100,
    },
    {
      period: '30 Days Avg',
      perDay: Math.round(data.thirtyDays.tweetsPerDay * 100) / 100,
      perHour: Math.round(data.thirtyDays.tweetsPerHour * 100) / 100,
    },
  ];

  const getTrendIcon = (trend: 'increasing' | 'stable' | 'decreasing') => {
    switch (trend) {
      case 'increasing':
        return '📈';
      case 'decreasing':
        return '📉';
      default:
        return '➡️';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Chart */}
      <motion.div variants={itemVariants} className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#000', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '3px solid #000',
                borderRadius: 0,
                boxShadow: '4px 4px 0 #000',
              }}
              formatter={(value: number) => [value, 'Tweets']}
            />
            <Bar dataKey="perDay" fill="#000" radius={0} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Trend Indicators */}
      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        variants={containerVariants}
      >
        {/* Today */}
        <motion.div
          className="border-2 border-black bg-white p-4"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '8px 8px 0 #000' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold uppercase text-gray-600">Today</div>
              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-sm font-bold text-gray-600">Per Day: </span>
                  <span className="text-2xl font-black text-black">{data.today.tweetsPerDay}</span>
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-600">Per Hour: </span>
                  <span className="text-lg font-black text-black">{data.today.tweetsPerHour}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 7 Days */}
        <motion.div
          className="border-2 border-black bg-white p-4"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '8px 8px 0 #000' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-bold uppercase text-gray-600">7 Days Average</div>
              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-sm font-bold text-gray-600">Per Day: </span>
                  <span className="text-2xl font-black text-black">
                    {Math.round(data.sevenDays.tweetsPerDay * 100) / 100}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-600">Per Hour: </span>
                  <span className="text-lg font-black text-black">
                    {Math.round(data.sevenDays.tweetsPerHour * 100) / 100}
                  </span>
                </div>
              </div>
            </div>
 
          </div>
          {data.sevenDays.trendPercentage > 0 && (
            <div className="mt-3 border-t-2 border-gray-200 pt-3 text-xs font-bold text-gray-600">
              {data.sevenDays.trend === 'increasing' ? '↑' : '↓'}{' '}
              {data.sevenDays.trendPercentage}% vs 30-day avg
            </div>
          )}
        </motion.div>

        {/* 30 Days */}
        <motion.div
          className="border-2 border-black bg-white p-4"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '8px 8px 0 #000' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold uppercase text-gray-600">30 Days Average</div>
              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-sm font-bold text-gray-600">Per Day: </span>
                  <span className="text-2xl font-black text-black">
                    {Math.round(data.thirtyDays.tweetsPerDay * 100) / 100}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-600">Per Hour: </span>
                  <span className="text-lg font-black text-black">
                    {Math.round(data.thirtyDays.tweetsPerHour * 100) / 100}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
