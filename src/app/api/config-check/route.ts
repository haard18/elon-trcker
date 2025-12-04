import { NextResponse } from 'next/server';

export async function GET() {
    const config = {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasTwitterApiKey: !!process.env.TWITTERIO_API_KEY,
        twitterBaseUrl: process.env.TWITTERIO_BASE || 'https://api.twitterio.com/user/elonmusk/tweets',
        pollLimit: process.env.POLL_LIMIT || '50',
        nodeEnv: process.env.NODE_ENV,
    };
    return NextResponse.json(config);
}
