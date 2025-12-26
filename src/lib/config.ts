/**
 * Validates required environment variables
 * Call this at the start of API routes that need config validation
 */
export function validateEnv() {
  const required = {
    MONGODB_URI: process.env.MONGODB_URI,
    TWITTERIO_API_KEY: process.env.TWITTERIO_API_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return true;
}

export function getConfig() {
  return {
    mongodb: {
      uri: process.env.MONGODB_URI!,
    },
    twitter: {
      baseUrl: process.env.TWITTERIO_BASE || 'https://api.twitterapi.io/twitter/user/last_tweets',
      apiKey: process.env.TWITTERIO_API_KEY!,
      username: process.env.TWITTERIO_USERNAME || 'elonmusk',
      includeReplies: process.env.TWITTERIO_INCLUDE_REPLIES === 'true',
      maxTweetsPerPoll: parseInt(process.env.MAX_TWEETS_PER_POLL || '200', 10),
      pollLimit: parseInt(process.env.POLL_LIMIT || '50', 10),
    },
    cron: {
      secret: process.env.CRON_SECRET,
    },
  };
}
