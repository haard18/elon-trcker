export interface Tweet {
  _id: string;
  text: string;
  created_at: Date;
  // Tweet type metadata (only these three types are counted)
  isRetweet?: boolean;        // Repost of another tweet
  isQuote?: boolean;           // Quote post (includes comment on another tweet)
  isReply?: boolean;           // Reply to another tweet (EXCLUDED from count)
}

export interface TwitterApiTweet {
  id: string;
  text: string;
  createdAt: string;
  // Metadata from Twitter API
  in_reply_to_status_id?: string | null;
  retweeted_status?: Record<string, unknown>;
  is_quote_status?: boolean;
}

export interface TwitterApiResponse {
  tweets: TwitterApiTweet[];
  has_next_page?: boolean;
  next_cursor?: string;
}

export interface DayStats {
  date: string;
  count: number;
}

export interface TodayStats {
  count: number;
  firstTweetTime: string | null;
  lastTweetTime: string | null;
}

export interface MonthStats {
  totalTweets: number;
  averagePerDay: number;
  zeroTweetDays: number;
  tweetsPerDay: DayStats[];
}

export interface HourlyStats {
  hour: number;
  count: number;
}

export interface HourlyStatsResponse {
  hourly: HourlyStats[];
  peakHours: number[];
  silentHours: number[];
  maxCount: number;
  totalTweets: number;
}

export interface WeekdayStats {
  weekday: number;
  count: number;
  average: number;
}

export interface WeekdayStatsResponse {
  weekSummary: WeekdayStats[];
  topDay: number;
  topDayName: string;
  totalTweets: number;
  averagePerDay: number;
}

export interface TweetTypeStats {
  text: number;
  replies: number;
  quotes: number;
  retweets: number;
  media: number;
  total: number;
}

export interface TweetTypePercentages {
  textPct: number;
  repliesPct: number;
  quotesPct: number;
  retweetsPct: number;
  mediaPct: number;
}

export interface TweetTypeBreakdown {
  type: string;
  count: number;
  percentage: number;
}

export interface TweetTypesResponse {
  counts: TweetTypeStats;
  percentages: TweetTypePercentages;
  breakdown: TweetTypeBreakdown[];
}

export interface EngagementMetrics {
  averageTweetsPerDay: number;
  medianTweetsPerDay: number;
  standardDeviation: number;
  minTweetsPerDay: number;
  maxTweetsPerDay: number;
  p25TweetsPerDay: number; // 25th percentile
  p75TweetsPerDay: number; // 75th percentile
  totalTweetsAllTime: number;
  daysWithTweets: number;
  totalDaysTracked: number;
  consistencyScore: number; // 0-100 percentage
  mostActiveDayOfWeek: string;
  mostActiveHour: string;
  tweetingFrequency: 'sparse' | 'moderate' | 'frequent' | 'very_frequent';
}

export interface EngagementMetricsResponse extends EngagementMetrics {
  lastCalculated: string;
}

export interface VelocityMetric {
  period: string; // 'today', '7days', '30days'
  tweetsPerHour: number;
  tweetsPerDay: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  trendPercentage: number;
}

export interface VelocityResponse {
  today: VelocityMetric;
  sevenDays: VelocityMetric;
  thirtyDays: VelocityMetric;
}

export interface ResponseTimeMetric {
  averageMinutesBetweenTweets: number;
  medianMinutesBetweenTweets: number;
  minMinutesBetweenTweets: number;
  maxMinutesBetweenTweets: number;
  responsiveness: 'very_slow' | 'slow' | 'moderate' | 'fast' | 'very_fast';
}

export interface ResponseTimeResponse extends ResponseTimeMetric {
  totalTweets: number;
  periodAnalyzed: string;
}

export interface BurstData {
  startTime: string;
  endTime: string;
  tweetCount: number;
  durationMinutes: number;
  tweetsPerMinute: number;
}

export interface BurstDetectionResponse {
  totalBursts: number;
  averageTweetsPerBurst: number;
  averageBurstDuration: number;
  longestBurst: BurstData | null;
  recentBursts: BurstData[];
  burstsPerWeek: number;
  quietPeriodsPerWeek: number;
}
