# Real-Time Tweet Monitoring Setup

This app now supports real-time tweet monitoring with pagination and incremental polling.

## Features

- ✅ **Pagination Support**: Fetches up to 200 tweets per poll across multiple pages
- ✅ **Time-Based Filtering**: Only fetches tweets newer than the last poll
- ✅ **Poll State Tracking**: Stores last poll time in MongoDB to avoid duplicates
- ✅ **Configurable Limits**: Control max tweets per poll via environment variables

## Configuration

Add these to your `.env` file:

```env
# TwitterAPI.io settings
TWITTERIO_USERNAME="elonmusk"
TWITTERIO_INCLUDE_REPLIES="false"
MAX_TWEETS_PER_POLL="200"

# Polling frequency (for automated polling)
POLL_INTERVAL_MINUTES="5"
```

## Running the Poll

### Manual (One-time)
```bash
# Via HTTP request
curl http://localhost:3000/api/poll

# Or use the script
npm run poll
```

### Automated (Continuous)
```bash
# Run continuously every 5 minutes
npm run poll:watch
```

### Production: Using Cron

For production, set up a cron job to call the endpoint:

```bash
# Edit crontab
crontab -e

# Add this line to poll every 5 minutes
*/5 * * * * curl -X GET http://localhost:3000/api/poll
```

### Production: Using Vercel Cron

If deployed on Vercel, use Vercel Cron (requires Pro plan):

1. Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/poll",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Production: External Cron Services (Free)

Use free services like:
- **Cron-job.org** (https://cron-job.org)
- **EasyCron** (https://www.easycron.com)
- **UptimeRobot** (https://uptimerobot.com) - Set up monitor with 5-min intervals

## Cost Optimization

Based on TwitterAPI.io pricing:

### Scenario 1: Every 5 minutes
- 288 checks/day × 30 days = 8,640 calls/month
- Estimated cost: **~$1.35/month**

### Scenario 2: Every 15 minutes  
- 96 checks/day × 30 days = 2,880 calls/month
- Estimated cost: **~$0.45/month**

### Scenario 3: Every 30 minutes
- 48 checks/day × 30 days = 1,440 calls/month
- Estimated cost: **~$0.23/month**

## API Response

The `/api/poll` endpoint returns:

```json
{
  "success": true,
  "fetched": 15,
  "upserted": 15,
  "modified": 0,
  "timestamp": "2025-12-04T12:00:00.000Z",
  "lastPollTime": "2025-12-04T11:55:00.000Z",
  "pagesProcessed": 1
}
```

## How It Works

1. **First Poll**: Fetches all available tweets (up to MAX_TWEETS_PER_POLL)
2. **Subsequent Polls**: Only fetches tweets newer than `lastPollTime`
3. **Pagination**: Automatically handles multiple pages if needed
4. **Smart Stopping**: Stops fetching when it reaches tweets older than last poll
5. **State Tracking**: Stores poll state in `poll_state` MongoDB collection

## Monitoring Multiple Accounts

To monitor multiple accounts, create separate cron jobs:

```bash
# Elon Musk
curl "http://localhost:3000/api/poll"

# Another account (modify route to accept username param)
curl "http://localhost:3000/api/poll?username=naval"
```

## Troubleshooting

- **No new tweets**: Normal if account hasn't posted since last poll
- **API errors**: Check your TWITTERIO_API_KEY and credits
- **Too many pages**: Increase POLL_INTERVAL_MINUTES or decrease MAX_TWEETS_PER_POLL
