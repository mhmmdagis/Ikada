import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();

        if (!session.isLoggedIn || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const categories = await prisma.galleryCategory.findMany({
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({
            success: true,
            categories: categories.map(c => c.name),
        });
    } catch (error) {
        console.error('[GALLERY CATEGORIES GET ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
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

        const name = rawName;

        const existing = await prisma.galleryCategory.findUnique({
            where: { name },
        });

        if (existing) {
            return NextResponse.json({ error: 'Gallery category already exists' }, { status: 400 });
        }

        const category = await prisma.galleryCategory.create({
            data: { name },
        });

        return NextResponse.json({ success: true, category }, { status: 201 });
    } catch (error) {
        console.error('[GALLERY CATEGORIES POST ERROR]', error);
        return NextResponse.json({ error: 'Failed to create gallery category' }, { status: 500 });
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

        const deleted = await prisma.galleryCategory.delete({
            where: { name: rawName },
        }).catch(() => null);

        if (!deleted) {
            return NextResponse.json({ error: 'Gallery category not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[GALLERY CATEGORIES DELETE ERROR]', error);
        return NextResponse.json({ error: 'Failed to delete gallery category' }, { status: 500 });
    }
}
