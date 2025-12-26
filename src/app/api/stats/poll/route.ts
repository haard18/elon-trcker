import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const pollStateCollection = db.collection('poll_state');
    const pollState = await pollStateCollection.findOne({ _id: 'last_poll' });

    return NextResponse.json({
      lastPollTime: pollState?.lastPollTime ? new Date(pollState.lastPollTime).toISOString() : null,
      lastTweetId: pollState?.lastTweetId ?? null,
    });
  } catch (error) {
    console.error('Failed to read poll state:', error);
    return NextResponse.json({ error: 'Failed to read poll state' }, { status: 500 });
  }
}
