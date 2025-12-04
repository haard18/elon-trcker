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
