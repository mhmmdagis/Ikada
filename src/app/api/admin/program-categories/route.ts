import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const items = await prisma.program.findMany({
            select: { category: true },
            distinct: ['category'],
            where: { category: { not: null } },
        });

        const categories = items
            .map(item => item.category)
            .filter((c): c is string => !!c)
            .sort((a, b) => a.localeCompare(b));

        return NextResponse.json({ success: true, categories });
    } catch (error) {
        console.error('[PROGRAM CATEGORIES GET ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch program categories' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const rawName = (body.name || '').trim();

        if (!rawName) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        // Since program categories are stored as plain strings on Program,
        // adding a category here simply makes it available in the UI list.
        // It will actually be "used" once a program is assigned this category.
        // To avoid duplicates, just check against existing list.
        const items = await prisma.program.findMany({
            select: { category: true },
            distinct: ['category'],
            where: { category: { not: null } },
        });

        const exists = items.some(item => item.category?.toLowerCase() === rawName.toLowerCase());
        if (exists) {
            return NextResponse.json({ error: 'Program category already exists in use' }, { status: 400 });
        }

        // We don't create any DB row here to avoid dummy programs;
        // the category will appear in the list only after at least one program uses it.
        // So we just echo success; the frontend will optimistically add it to its local list.
        return NextResponse.json({ success: true, name: rawName }, { status: 201 });
    } catch (error) {
        console.error('[PROGRAM CATEGORIES POST ERROR]', error);
        return NextResponse.json({ error: 'Failed to create program category' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const rawName = (body.name || '').trim();

        if (!rawName) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        const result = await prisma.program.updateMany({
            where: { category: rawName },
            data: { category: null },
        });

        // It's okay if no program used this category; we still treat it as success
        return NextResponse.json({ success: true, affected: result.count });
    } catch (error) {
        console.error('[PROGRAM CATEGORIES DELETE ERROR]', error);
        return NextResponse.json({ error: 'Failed to delete program category' }, { status: 500 });
    }
}

