"use client";

import { motion } from "framer-motion";
import { BurstDetectionResponse } from "@/lib/types";

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

const barVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.6 },
  },
};

export default function BurstMetrics({
  data,
}: {
  data: BurstDetectionResponse;
}) {
  const maxTweets = data.longestBurst?.tweetCount || 1;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Burst Statistics Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        {/* Total Bursts */}
        <div className="border-2 border-black bg-white p-4 hover:shadow-lg hover:shadow-black transition-shadow">
          <p className="text-xs font-bold uppercase tracking-tight text-black mb-2">
            Total Bursts
          </p>
          <motion.p
            variants={numberVariants}
            className="text-4xl font-black text-black"
          >
            {data.totalBursts}
          </motion.p>
          <p className="text-xs text-gray-500 mt-1">detected</p>
        </div>

        {/* Avg Tweets per Burst */}
        <div className="border-2 border-black bg-white p-4 hover:shadow-lg hover:shadow-black transition-shadow">
          <p className="text-xs font-bold uppercase tracking-tight text-black mb-2">
            Avg Tweets/Burst
          </p>
          <motion.p
            variants={numberVariants}
            className="text-4xl font-black text-black"
          >
            {data.averageTweetsPerBurst.toFixed(1)}
          </motion.p>
          <p className="text-xs text-gray-500 mt-1">per burst</p>
        </div>

        {/* Avg Duration */}
        <div className="border-2 border-black bg-white p-4 hover:shadow-lg hover:shadow-black transition-shadow">
          <p className="text-xs font-bold uppercase tracking-tight text-black mb-2">
            Avg Duration
          </p>
          <motion.p
            variants={numberVariants}
            className="text-4xl font-black text-black"
          >
            {data.averageBurstDuration.toFixed(1)}
          </motion.p>
          <p className="text-xs text-gray-500 mt-1">minutes</p>
        </div>

        {/* Bursts Per Week */}
        <div className="border-2 border-black bg-white p-4 hover:shadow-lg hover:shadow-black transition-shadow">
          <p className="text-xs font-bold uppercase tracking-tight text-black mb-2">
            Bursts/Week
          </p>
          <motion.p
            variants={numberVariants}
            className="text-4xl font-black text-black"
          >
            {data.burstsPerWeek.toFixed(1)}
          </motion.p>
          <p className="text-xs text-black mt-1">frequency</p>
        </div>
      </motion.div>

      {/* Longest Burst */}
      {data.longestBurst && (
        <motion.div
          variants={itemVariants}
          className="border-2 border-black bg-white p-6"
        >
          <p className="text-xs font-bold uppercase tracking-tight text-black mb-4">
            Longest Burst
          </p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-black font-bold">
                  {data.longestBurst.tweetCount} tweets in{" "}
                  {data.longestBurst.durationMinutes} minutes
                </span>
                <span className="text-xs text-black">
                  {data.longestBurst.tweetsPerMinute} tweets/min
                </span>
              </div>
              <motion.div
                variants={barVariants}
                className="h-8 bg-black origin-left flex items-center justify-end pr-3"
                style={{
                  width: `${(data.longestBurst.tweetCount / maxTweets) * 100}%`,
                }}
              >
                <span className="text-white font-black text-sm">
                  {data.longestBurst.tweetCount}
                </span>
              </motion.div>
            </div>
            <div className="text-xs text-black space-y-1">
              <p>
                Start: {new Date(data.longestBurst.startTime).toLocaleString()}
              </p>
              <p>End: {new Date(data.longestBurst.endTime).toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Bursts */}
      {data.recentBursts.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="border-2 border-black bg-white p-6"
        >
          <p className="text-xs font-bold uppercase tracking-tight text-black mb-4">
            Recent Bursts (Last {data.recentBursts.length})
          </p>
          <div className="space-y-3">
            {data.recentBursts.map((burst, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="pb-3 border-b-2 border-gray-200 last:border-b-0"
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-black text-md">
                    {burst.tweetCount} tweets
                  </span>
                  <span className="text-md text-black">
                    {burst.tweetsPerMinute} tweets/min
                  </span>
                </div>
                <motion.div
                  variants={barVariants}
                  className="h-6 bg-orange-400 origin-left flex items-center p-5 mb-1"
                  style={{
                    width: `${(burst.tweetCount / maxTweets) * 100}%`,
                  }}
                >
                  <span className="text-black font-bold text-md text-center m-5 ">
                    {burst.tweetCount}
                  </span>
                </motion.div>
                <p className="text-xs text-gray-500">
                  {new Date(burst.startTime).toLocaleString()} →{" "}
                  {new Date(burst.endTime).toLocaleTimeString()}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {data.totalBursts === 0 && (
        <motion.div
          variants={itemVariants}
          className="border-2 border-black bg-gray-100 p-6 text-center"
        >
          <p className="text-sm font-bold text-gray-700">
            No tweet bursts detected yet
          </p>
          <p className="text-xs text-black mt-1">
            A burst is 3+ tweets within 30 minutes
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
