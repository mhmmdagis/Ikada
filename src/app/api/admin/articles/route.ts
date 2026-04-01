import { NextRequest, NextResponse } from 'next/server';
import { getSession, isAdminRole } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();
        
        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const articles = await prisma.article.findMany({
            include: {
                author: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(articles);
    } catch (error) {
        console.error('[GET ARTICLES ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        
        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { articleId } = await req.json();

        if (!articleId) {
            return NextResponse.json({ error: 'Article ID required' }, { status: 400 });
        }

        // Delete likes first (foreign key constraint)
        await prisma.like.deleteMany({
            where: { articleId },
        });

        // there is no Comment.articleId field in schema, comments are for forums only
        // simply delete the article afterwards
        await prisma.article.delete({
            where: { id: articleId },
        });

        return NextResponse.json({ success: true, message: 'Article deleted' });
    } catch (error) {
        console.error('[DELETE ARTICLE ERROR]', error);
        return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }
}
