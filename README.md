# Elon Musk Twitter Analytics

A production-ready Next.js application that automatically tracks and analyzes Elon Musk's Twitter activity with hourly polling.

## ✨ Features

- **Automatic Hourly Polling**: Fetches new tweets every hour via cron job
- **Minimalistic UI**: Clean, modern dashboard with collapsible analytics sections  
- **Real-time Analytics**: Daily, weekly, monthly stats with advanced metrics
- **Production Ready**: Environment validation, error handling, health checks

## 🚀 Quick Start

1. **Clone and install**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Run locally**:
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment instructions.

### Quick Deploy to Vercel

```bash
vercel
```

The app includes automatic hourly polling via Vercel Cron. Just add your environment variables in the Vercel dashboard.

## 🔧 Environment Variables

Required variables (see `.env.example`):
- `MONGODB_URI` - MongoDB connection string
- `TWITTERIO_API_KEY` - Twitter API key
- `TWITTERIO_USERNAME` - Twitter username to track (default: elonmusk)
- `CRON_SECRET` - Secure random string for cron authentication

## 📚 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [POLLING.md](POLLING.md) - Polling mechanism details

## 🛠️ Tech Stack

- Next.js 16 with App Router
- React 19
- MongoDB
- Tailwind CSS
- TypeScript
- Recharts

## 📊 API Endpoints

- `/api/stats/*` - Various analytics endpoints
- `/api/cron/poll` - Hourly cron trigger (secured)
- `/api/health` - Health check endpoint

## License

MIT
