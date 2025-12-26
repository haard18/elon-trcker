# Elon Musk Twitter Analytics

A production-ready Next.js application that automatically tracks and analyzes Elon Musk's Twitter activity with hourly polling.

## Features

- **Automatic Hourly Polling**: Fetches new tweets every hour via cron job
- **Minimalistic UI**: Clean, modern dashboard with collapsible analytics sections
- **Real-time Analytics**: 
  - Daily, weekly, and monthly statistics
  - Engagement metrics and consistency scores
  - Posting velocity and trends
  - Response time analysis
  - Burst detection patterns
  - Hourly activity heatmaps
  - Weekday distribution

## Tech Stack

- Next.js 16
- React 19
- MongoDB
- Tailwind CSS
- Recharts for visualizations
- TypeScript

## Environment Setup

Create a `.env` file with the following variables:

```env
# MongoDB
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/database"

# Twitter API
TWITTERIO_BASE="https://api.twitterapi.io/twitter/user/last_tweets"
TWITTERIO_API_KEY="your_api_key_here"
TWITTERIO_USERNAME="elonmusk"
TWITTERIO_INCLUDE_REPLIES="false"
MAX_TWEETS_PER_POLL="200"

# Cron Security (recommended for production)
CRON_SECRET="your_random_secret_string"
```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Manual polling (optional)
npm run poll
```

Visit [http://localhost:3000](http://localhost:3000)

## Production Deployment

### Vercel (Recommended)

1. **Deploy to Vercel**:
   ```bash
   vercel
   ```

2. **Add Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env`

3. **Automatic Cron Setup**:
   - The `vercel.json` file configures hourly polling automatically
   - Vercel Cron will call `/api/cron/poll` every hour on the hour

4. **Secure the Cron Endpoint**:
   - Generate a secure random string: `openssl rand -base64 32`
   - Add it as `CRON_SECRET` in Vercel environment variables
   - Vercel automatically adds this to cron job requests

### Alternative Deployment Options

If not using Vercel's built-in cron:

1. **External Cron Service** (e.g., cron-job.org, EasyCron):
   ```bash
   # Configure external cron to call:
   curl -X GET https://yourdomain.com/api/cron/poll \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

2. **GitHub Actions**:
   ```yaml
   # .github/workflows/poll.yml
   name: Hourly Tweet Poll
   on:
     schedule:
       - cron: '0 * * * *'  # Every hour
   jobs:
     poll:
       runs-on: ubuntu-latest
       steps:
         - name: Trigger Poll
           run: |
             curl -X GET ${{ secrets.APP_URL }}/api/cron/poll \
               -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
   ```

## API Endpoints

- `GET /api/stats/today` - Today's tweet count and times
- `GET /api/stats/7days` - Last 7 days statistics
- `GET /api/stats/month` - Monthly breakdown
- `GET /api/stats/hourly` - Hourly heatmap data
- `GET /api/stats/engagement` - Engagement metrics
- `GET /api/stats/velocity` - Posting velocity trends
- `GET /api/cron/poll` - Cron endpoint (requires auth)
- `GET /api/poll` - Manual polling trigger

## Database Collections

- `tweets` - Stores all fetched tweets
- `poll_state` - Tracks last poll time and cursor

## Monitoring

Check application logs in Vercel Dashboard:
- Runtime Logs - View cron execution
- Functions - Monitor API performance
- Analytics - Track usage

## Troubleshooting

### Polling Not Working

1. Check Vercel Function Logs for cron execution
2. Verify `CRON_SECRET` is set correctly
3. Test manual poll: `curl https://yourdomain.com/api/poll`

### No Data Showing

1. Check MongoDB connection: verify `MONGODB_URI`
2. Run manual poll to fetch initial data
3. Check browser console for API errors

### Rate Limiting

If hitting Twitter API limits:
- Adjust `MAX_TWEETS_PER_POLL` to a lower value
- Increase polling interval in `vercel.json`

## License

MIT

## Credits

Built with Next.js and deployed on Vercel.
