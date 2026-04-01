import { NextResponse } from 'next/server';
import { getSession, isAdminRole } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();
        
        // Check if user is admin
        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [users, articles, forums, comments, events, galleries, programs] = await Promise.all([
            prisma.user.count(),
            prisma.article.count(),
            prisma.forum.count(),
            prisma.comment.count(),
            prisma.event.count(),
            prisma.galleryItem.count(),
            prisma.program.count(),
        ]);

        const publishedArticles = await prisma.article.count({
            where: { published: true },
        });

        return NextResponse.json({
            users,
            articles,
            publishedArticles,
            unpublishedArticles: articles - publishedArticles,
            forums,
            comments,
            events,
            galleries,
            programs,
        });
    } catch (error) {
        console.error('[ADMIN STATS ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
