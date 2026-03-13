import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: 'asc' },
        });
        return NextResponse.json(events);
    } catch (error) {
        console.error('[GET EVENTS ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}