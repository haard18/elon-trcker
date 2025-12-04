#!/usr/bin/env ts-node
/**
 * Tweet Polling Script
 * 
 * This script calls the /api/poll endpoint to fetch new tweets.
 * Can be run manually or via cron job for real-time monitoring.
 * 
 * Usage:
 *   npm run poll              # Run once
 *   npm run poll:watch        # Run continuously (every 5 min)
 */

const POLL_ENDPOINT = process.env.POLL_ENDPOINT || 'http://localhost:3000/api/poll';
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MINUTES || '5', 10) * 60 * 1000;

async function pollTweets() {
  try {
    console.log(`[${new Date().toISOString()}] Polling for new tweets...`);
    
    const response = await fetch(POLL_ENDPOINT);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✓ Poll successful:', {
        fetched: data.fetched,
        upserted: data.upserted,
        modified: data.modified,
        pages: data.pagesProcessed,
      });
    } else {
      console.error('✗ Poll failed:', data);
    }
  } catch (error) {
    console.error('✗ Poll error:', error);
  }
}

async function main() {
  const watchMode = process.argv.includes('--watch');
  
  if (watchMode) {
    console.log(`Starting continuous polling every ${POLL_INTERVAL / 60000} minutes...`);
    console.log('Press Ctrl+C to stop\n');
    
    // Poll immediately
    await pollTweets();
    
    // Then poll at intervals
    setInterval(pollTweets, POLL_INTERVAL);
  } else {
    await pollTweets();
  }
}

main();
