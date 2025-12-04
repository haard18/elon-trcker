import { deleteAllTweets, deletePollState } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
export async function DELETE() {
    try {
        // For example, if using MongoDB:
        // Here you would add logic to clear data from your database
        // const collection = await getYourCollection();
        // await collection.deleteMany({});
        try {
            await deleteAllTweets();
            await deletePollState();
            return NextResponse.json({ message: 'Data cleared successfully' });
        } catch (err) {
            throw err;
        }
    } catch (error) {
        console.error('Clear data error:', error);
        return NextResponse.json(
            { error: 'Failed to clear data', details: String(error) },
            { status: 500 }
        );
    }
}