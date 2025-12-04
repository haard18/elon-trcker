# Elon Tracker

A Next.js 14 dashboard that tracks Elon Musk's tweets using the TwitterIO API and stores them in MongoDB.

## Features

- **Tweet Polling**: Fetches tweets from TwitterIO API and stores them in MongoDB
- **Analytics Dashboard**: View tweet statistics for today, last 7 days, and the current month
- **Live Feed**: Browse recent tweets with relative timestamps
- **Auto-refresh**: Dashboard updates every 30 seconds
- **Neubrutalist Design**: Clean black and white robotic styling

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **MongoDB**
- **TailwindCSS**
- **Recharts** (for bar charts)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your values:

```env
MONGODB_URI="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/?retryWrites=true&w=majority"
TWITTERIO_BASE="https://api.twitterapi.io/twitter/user/last_tweets"
TWITTERIO_API_KEY="your-twitterio-api-key"
POLL_LIMIT=50
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

| Route | Description |
|-------|-------------|
| `GET /api/poll` | Fetches tweets from TwitterIO and upserts into MongoDB |
| `GET /api/stats/today` | Returns today's tweet count, first and last tweet times |
| `GET /api/stats/7days` | Returns tweet counts for the last 7 days |
| `GET /api/stats/month` | Returns monthly statistics (total, average, zero days) |
| `GET /api/tweets/recent` | Returns the last 50 tweets sorted by date |

## Pages

- **`/`** - Main dashboard with analytics cards and monthly breakdown
- **`/feed`** - Live feed of recent tweets

## MongoDB Schema

The `tweets` collection uses the following schema:

```typescript
{
  _id: string,      // Tweet ID from Twitter
  text: string,     // Tweet content
  created_at: Date  // When the tweet was posted
}
```

## Usage

1. Click **"Poll Now"** on the dashboard to fetch the latest tweets
2. View analytics in the dashboard cards
3. Navigate to **Feed** to see individual tweets
4. Enable **Auto-refresh** on the feed page for live updates

## License

MIT
