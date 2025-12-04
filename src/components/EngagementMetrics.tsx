'use client';

import { motion } from 'framer-motion';
import { EngagementMetricsResponse } from '@/lib/types';

interface EngagementMetricsProps {
  data: EngagementMetricsResponse;
}

const frequencyColors: Record<string, string> = {
  sparse: 'bg-yellow-100 text-yellow-900',
  moderate: 'bg-blue-100 text-blue-900',
  frequent: 'bg-orange-100 text-orange-900',
  very_frequent: 'bg-red-100 text-red-900',
};

const frequencyLabels: Record<string, string> = {
  sparse: 'Sparse (<1/day)',
  moderate: 'Moderate (1-5/day)',
  frequent: 'Frequent (5-20/day)',
  very_frequent: 'Very Frequent (20+/day)',
};

export default function EngagementMetrics({ data }: EngagementMetricsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  const numberVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top Row - Key Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Average Tweets Per Day */}
        <motion.div
          className="border-2 border-black bg-white p-4"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '8px 8px 0 #000' }}
        >
          <div className="text-xs font-bold uppercase text-gray-600">Avg Tweets/Day</div>
          <motion.div
            className="mt-2 text-3xl font-black text-black"
            variants={numberVariants}
          >
            {data.averageTweetsPerDay}
          </motion.div>
        </motion.div>

        {/* Median Tweets Per Day */}
        <motion.div
          className="border-2 border-black bg-white p-4"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '8px 8px 0 #000' }}
        >
          <div className="text-xs font-bold uppercase text-gray-600">Median Tweets/Day</div>
          <motion.div
            className="mt-2 text-3xl font-black text-black"
            variants={numberVariants}
          >
            {data.medianTweetsPerDay}
          </motion.div>
        </motion.div>

        {/* Standard Deviation */}
        <motion.div
          className="border-2 border-black bg-white p-4"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '8px 8px 0 #000' }}
        >
          <div className="text-xs font-bold uppercase text-gray-600">Std Deviation</div>
          <motion.div
            className="mt-2 text-3xl font-black text-black"
            variants={numberVariants}
          >
            {data.standardDeviation}
          </motion.div>
        </motion.div>

        {/* Consistency Score */}
        <motion.div
          className="border-2 border-black bg-white p-4"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '8px 8px 0 #000' }}
        >
          <div className="text-xs font-bold uppercase text-gray-600">Consistency</div>
          <motion.div
            className="mt-2 flex items-baseline gap-1"
            variants={numberVariants}
          >
            <span className="text-3xl font-black text-black">{data.consistencyScore}</span>
            <span className="text-sm font-bold text-gray-600">%</span>
          </motion.div>
          <motion.div
            className="mt-2 h-2 bg-gray-200"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{ originX: 0 }}
          >
            <div
              className="h-full bg-black"
              style={{ width: `${data.consistencyScore}%` }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Distribution Stats Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {/* Min Tweets */}
        <motion.div
          className="border-2 border-black bg-white p-4"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '8px 8px 0 #000' }}
        >
          <div className="text-xs font-bold uppercase text-gray-600">Min/Day</div>
          <motion.div
            className="mt-2 text-2xl font-black text-black"
            variants={numberVariants}
          >
            {data.minTweetsPerDay}
          </motion.div>
        </motion.div>

        {/* 25th Percentile */}
        <motion.div
          className="border-2 border-black bg-white p-4"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '8px 8px 0 #000' }}
        >
          <div className="text-xs font-bold uppercase text-gray-600">25th %ile</div>
          <motion.div
            className="mt-2 text-2xl font-black text-black"
            variants={numberVariants}
          >
            {data.p25TweetsPerDay}
          </motion.div>
        </motion.div>

        {/* Total Tweets */}
        <motion.div
          className="border-2 border-black bg-white p-4"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '8px 8px 0 #000' }}
        >
          <div className="text-xs font-bold uppercase text-gray-600">Total Tweets</div>
          <motion.div
            className="mt-2 text-2xl font-black text-black"
            variants={numberVariants}
          >
            {data.totalTweetsAllTime}
          </motion.div>
        </motion.div>

        {/* 75th Percentile */}
        <motion.div
          className="border-2 border-black bg-white p-4"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '8px 8px 0 #000' }}
        >
          <div className="text-xs font-bold uppercase text-gray-600">75th %ile</div>
          <motion.div
            className="mt-2 text-2xl font-black text-black"
            variants={numberVariants}
          >
            {data.p75TweetsPerDay}
          </motion.div>
        </motion.div>

        {/* Max Tweets */}
        <motion.div
          className="border-2 border-black bg-white p-4"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '8px 8px 0 #000' }}
        >
          <div className="text-xs font-bold uppercase text-gray-600">Max/Day</div>
          <motion.div
            className="mt-2 text-2xl font-black text-black"
            variants={numberVariants}
          >
            {data.maxTweetsPerDay}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Row - Pattern Analysis */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Days with Activity */}
        <motion.div
          className="border-2 border-black bg-white p-4"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '8px 8px 0 #000' }}
        >
          <div className="text-xs font-bold uppercase text-gray-600">Active Days</div>
          <motion.div
            className="mt-3 text-2xl font-black text-black"
            variants={numberVariants}
          >
            {data.daysWithTweets}/{data.totalDaysTracked}
          </motion.div>
        </motion.div>

        {/* Most Active Day */}
        <motion.div
          className="border-2 border-black bg-white p-4"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '8px 8px 0 #000' }}
        >
          <div className="text-xs font-bold uppercase text-gray-600">Most Active Day</div>
          <motion.div
            className="mt-3 text-2xl font-black text-black"
            variants={numberVariants}
          >
            {data.mostActiveDayOfWeek}
          </motion.div>
        </motion.div>

        {/* Peak Hour */}
        <motion.div
          className="border-2 border-black bg-white p-4"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '8px 8px 0 #000' }}
        >
          <div className="text-xs font-bold uppercase text-gray-600">Peak Hour (UTC)</div>
          <motion.div
            className="mt-3 text-2xl font-black text-black"
            variants={numberVariants}
          >
            {data.mostActiveHour}
          </motion.div>
        </motion.div>
      </div>

      {/* Tweeting Frequency */}
      <motion.div
        className="border-2 border-black bg-white p-4"
        variants={itemVariants}
        whileHover={{ scale: 1.02, boxShadow: '8px 8px 0 #000' }}
      >
        <div className="text-xs font-bold uppercase text-gray-600">Tweeting Frequency</div>
        <motion.div
          className={`mt-3 inline-block rounded px-4 py-3 text-sm font-black uppercase ${frequencyColors[data.tweetingFrequency]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {frequencyLabels[data.tweetingFrequency]}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
