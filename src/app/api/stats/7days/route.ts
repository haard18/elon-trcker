import { NextResponse } from 'next/server';
import { getTweetsCollection } from '@/lib/mongodb';
import { DayStats } from '@/lib/types';

export async function GET() {
  try {
    const collection = await getTweetsCollection();
    
    const now = new Date();
    const days: DayStats[] = [];
    
    // Get last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const nextDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i + 1));
      
      const count = await collection.countDocuments({
        created_at: {
          $gte: date,
          $lt: nextDate,
        },
      });
      
      days.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    return NextResponse.json(days);
  } catch (error) {
    console.error('7 days stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get 7 days stats', details: String(error) },
      { status: 500 }
    );
  }
}
