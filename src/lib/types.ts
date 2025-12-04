export interface Tweet {
  _id: string;
  text: string;
  created_at: Date;
}

export interface TwitterApiTweet {
  id: string;
  text: string;
  createdAt: string;
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
