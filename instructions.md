

**Build a Next.js 14 project (App Router) that tracks Elon Musk’s tweets using the TwitterIO API and stores them in MongoDB.
Implement the following:**

### **1. MongoDB Setup**

* Create a `/lib/mongodb.ts` with a cached MongoClient.
* Use a DB called `elon-tracker`.
* Create a `tweets` collection with fields:

  ```ts
  {
    _id: string,         // tweet id
    text: string,
    created_at: Date
  }
  ```

### **2. Server-side Cron/Poller**

* Create an API route at `app/api/poll/route.ts` that:

  * Calls: `https://api.twitterio.com/user/elonmusk/tweets?limit=50`
  * Normalizes tweets (id, text, created_at)
  * Upserts into MongoDB using tweet `_id`
* This route should run safely multiple times without duplicating documents.

### **3. Analytics Routes**

Create these API routes:

#### `/api/stats/today`

* Return:

  * count of tweets today
  * first tweet time
  * last tweet time

#### `/api/stats/7days`

* Return an array of `{ date, count }` for the last 7 days.

#### `/api/stats/month`

* For the current month return:

  * totalTweets
  * averagePerDay
  * zeroTweetDays
  * tweetsPerDay[]

### **4. Live Feed Route**

Create `/api/tweets/recent` that returns the last 50 tweets sorted by `created_at` DESC.

### **5. Frontend Pages (App Router)**

Create a clean dashboard UI:

#### `/`

* Card 1: "Today" (tweets today, first/last times)
* Card 2: "Last 7 Days" with a bar chart (use Recharts)
* Card 3: "This Month" (total, average, zero days)
* Section: table of all days this month and their counts
* Auto-refresh every 30–60 secs using `useEffect` + fetch

#### `/feed`

* List of recent tweets with relative timestamps
* Manual “refresh” button
* Auto-refresh optional

### **6. Styling**

* Use TailwindCSS
* Simple clean dashboard cards
* Responsive layout
* Neubrutalist robotic, black and white

### **7. Environment Variables**

Add to `.env.local`:

```
MONGODB_URI="mongodb+srv://..."
TWITTERIO_BASE="https://api.twitterio.com/user/elonmusk/tweets"
POLL_LIMIT=50
```

### **8. Optional**

If you want, include a simple button to manually trigger `api/poll`.

https://docs.twitterapi.io/api-reference/endpoint/get_user_last_tweets
