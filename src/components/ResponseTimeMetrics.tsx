'use client';

import { motion } from 'framer-motion';
import { ResponseTimeResponse } from '@/lib/types';

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
  hidden: { scale: 0 },
  visible: { scale: 1, transition: { duration: 0.5 } },
};

const getResponsivenessColor = (
  responsiveness: string
): string => {
  switch (responsiveness) {
    case 'very_fast':
      return 'bg-green-100 text-green-900';
    case 'fast':
      return 'bg-blue-100 text-blue-900';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-900';
    case 'slow':
      return 'bg-orange-100 text-orange-900';
    case 'very_slow':
      return 'bg-red-100 text-red-900';
    default:
      return 'bg-gray-100 text-gray-900';
  }
};

const getResponsivenessLabel = (responsiveness: string): string => {
  return responsiveness
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function ResponseTimeMetrics({
  data,
}: {
  data: ResponseTimeResponse;
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Main Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Average */}
        <div className="border-2 border-black bg-white p-4 hover:shadow-lg hover:shadow-black transition-shadow">
          <p className="text-xs font-bold uppercase tracking-tight text-gray-600 mb-2">
            Average Minutes
          </p>
          <motion.p
            variants={numberVariants}
            className="text-3xl font-black text-black"
          >
            {data.averageMinutesBetweenTweets}
          </motion.p>
          <p className="text-xs text-gray-500 mt-1">between tweets</p>
        </div>

        {/* Median */}
        <div className="border-2 border-black bg-white p-4 hover:shadow-lg hover:shadow-black transition-shadow">
          <p className="text-xs font-bold uppercase tracking-tight text-gray-600 mb-2">
            Median Minutes
          </p>
          <motion.p
            variants={numberVariants}
            className="text-3xl font-black text-black"
          >
            {data.medianMinutesBetweenTweets}
          </motion.p>
          <p className="text-xs text-gray-500 mt-1">typical gap</p>
        </div>

        {/* Min */}
        <div className="border-2 border-black bg-white p-4 hover:shadow-lg hover:shadow-black transition-shadow">
          <p className="text-xs font-bold uppercase tracking-tight text-gray-600 mb-2">
            Minimum Gap
          </p>
          <motion.p
            variants={numberVariants}
            className="text-3xl font-black text-black"
          >
            {data.minMinutesBetweenTweets}
          </motion.p>
          <p className="text-xs text-gray-500 mt-1">fastest response</p>
        </div>

        {/* Max */}
        <div className="border-2 border-black bg-white p-4 hover:shadow-lg hover:shadow-black transition-shadow">
          <p className="text-xs font-bold uppercase tracking-tight text-gray-600 mb-2">
            Maximum Gap
          </p>
          <motion.p
            variants={numberVariants}
            className="text-3xl font-black text-black"
          >
            {data.maxMinutesBetweenTweets}
          </motion.p>
          <p className="text-xs text-gray-500 mt-1">longest quiet period</p>
        </div>
      </motion.div>

      {/* Responsiveness Classification */}
      <motion.div variants={itemVariants} className="border-2 border-black bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-tight text-gray-600 mb-4">
          Responsiveness Level
        </p>
        <div className="flex items-center gap-4">
          <div
            className={`px-6 py-3 border-2 border-black font-black uppercase tracking-tight ${getResponsivenessColor(
              data.responsiveness
            )}`}
          >
            {getResponsivenessLabel(data.responsiveness)}
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-bold mb-1">Classification based on average time between tweets:</p>

          </div>
        </div>
      </motion.div>

      {/* Period Info */}
      {data.periodAnalyzed && (
        <motion.div variants={itemVariants} className="border-2 border-black bg-gray-100 p-4">
          <p className="text-xs font-bold uppercase tracking-tight text-gray-700">
            Period Analyzed: {data.periodAnalyzed}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Total tweets: {data.totalTweets}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
