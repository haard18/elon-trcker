import { NextResponse } from 'next/server';
import { getTweetsCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const collection = await getTweetsCollection();
    
    const tweets = await collection
      .find({})
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(tweets);
  } catch (error) {
    console.error('Recent tweets error:', error);
    return NextResponse.json(
      { error: 'Failed to get recent tweets', details: String(error) },
      { status: 500 }
    );
  }
}
