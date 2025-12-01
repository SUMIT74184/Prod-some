import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await getDb();
    await db.admin().ping();
    return NextResponse.json({ message: 'Database connection successful!' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Database connection failed!', error: error.message }, { status: 500 });
  }
}
