import { NextResponse } from 'next/server';
import { validateEnv } from '@/lib/config';

export async function GET() {
  try {
    validateEnv();
    
    return NextResponse.json({
      status: 'ok',
      mongodb: process.env.MONGODB_URI ? 'configured' : 'missing',
      twitterApi: process.env.TWITTERIO_API_KEY ? 'configured' : 'missing',
      cronSecret: process.env.CRON_SECRET ? 'configured' : 'missing',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Configuration check failed',
      },
      { status: 500 }
    );
  }
}
