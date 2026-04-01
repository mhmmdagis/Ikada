import { NextRequest, NextResponse } from 'next/server';
import { getSession, isAdminRole } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error('[GET CATEGORIES ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();

        // Only admins can create categories
        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized - admin only' }, { status: 401 });
        }

        const { name, slug, color } = await req.json();

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Category name required' }, { status: 400 });
        }

        // Generate slug from name if not provided
        const finalSlug =
            slug ||
            name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

        // Check if category already exists
        const existing = await prisma.category.findUnique({
            where: { slug: finalSlug },
        });

        if (existing) {
            return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: {
                name: name.trim(),
                slug: finalSlug,
                color: color || '#2ec4b6',
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('[CREATE CATEGORY ERROR]', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();

        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized - admin only' }, { status: 401 });
        }

        const { categoryId } = await req.json();

        if (!categoryId) {
            return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
        }

        // Remove category from all articles
        await prisma.article.updateMany({
            where: { categoryId },
            data: { categoryId: null },
        });

        // Remove category from all forums
        await prisma.forum.updateMany({
            where: { categoryId },
            data: { categoryId: null },
        });

        // Delete category
        await prisma.category.delete({
            where: { id: categoryId },
        });

        return NextResponse.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        console.error('[DELETE CATEGORY ERROR]', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
