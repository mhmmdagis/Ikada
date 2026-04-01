import { NextRequest, NextResponse } from 'next/server';
import { getSession, isAdminRole } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const categories = await prisma.programCategory.findMany({
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ success: true, categories });
    } catch (error) {
        console.error('[PROGRAM CATEGORIES GET ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch program categories' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const rawName = (body.name || '').trim();
        const rawSlug = (body.slug || '').trim();
        const color = body.color || '#2ec4b6';

        if (!rawName) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        const name = rawName;
        const slug = rawSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const existing = await prisma.programCategory.findFirst({
             where: {
                 OR: [
                     { name },
                     { slug }
                 ]
             }
        });

        if (existing) {
            return NextResponse.json({ error: 'Program category with this name or slug already exists' }, { status: 400 });
        }

        const category = await prisma.programCategory.create({
            data: { name, slug, color }
        });

        return NextResponse.json({ success: true, category }, { status: 201 });
    } catch (error) {
        console.error('[PROGRAM CATEGORIES POST ERROR]', error);
        return NextResponse.json({ error: 'Failed to create program category' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const id = body.categoryId || body.id;

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        const deleted = await prisma.programCategory.delete({
            where: { id },
        }).catch(() => null);

        if (!deleted) {
            return NextResponse.json({ error: 'Program category not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, deletedId: id });
    } catch (error) {
        console.error('[PROGRAM CATEGORIES DELETE ERROR]', error);
        return NextResponse.json({ error: 'Failed to delete program category' }, { status: 500 });
    }
}

