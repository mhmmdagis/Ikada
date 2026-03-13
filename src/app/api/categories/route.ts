import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
        return NextResponse.json(categories);
    } catch (err) {
        console.error('[CATEGORIES GET]', err);
        return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
    }
}