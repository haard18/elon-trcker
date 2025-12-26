import { NextResponse } from 'next/server';

/**
 * Cron endpoint for automatic hourly polling
 * This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions, or external cron)
 * 
 * To set up with Vercel:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/poll",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 * 
 * Authorization header should match CRON_SECRET env var for security
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, verify it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the base URL from the request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Call the existing poll endpoint
    const pollResponse = await fetch(`${baseUrl}/api/poll`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const pollData = await pollResponse.json();

    if (!pollResponse.ok) {
      console.error('Poll failed:', pollData);
      return NextResponse.json(
        { 
          success: false, 
          error: pollData.error || 'Poll failed',
          timestamp: new Date().toISOString(),
        },
        { status: pollResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: pollData,
    });
  } catch (error) {
    console.error('Cron poll error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
