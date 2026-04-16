import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import DashboardContent from './DashboardContent';

export const metadata = {
    title: 'Dashboard - Disada',
    description: 'Dashboard aktivitas Anda di platform Disada',
};

export default async function DashboardPage() {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
        redirect('/login?next=/dashboard');
    }

    const isAdmin = session.role === 'ADMIN' || session.role === 'SUPER_ADMIN';
    const limit = 30;
    const myLimit = 10;

    // Build where clauses based on user role
    const authorFilter = isAdmin ? {} : { authorId: session.userId };

    // Fetch data in parallel on the server
    const [
        recentArticles, recentForums, recentComments, recentUsers, recentEvents, recentGallery,
        myArticles, myForums, myComments,
        statsData
    ] = await Promise.all([
        prisma.article.findMany({
            take: Math.ceil(limit / (isAdmin ? 5 : 3)),
            orderBy: { createdAt: 'desc' },
            where: authorFilter,
            include: { author: true, category: true }
        }),
        prisma.forum.findMany({
            take: Math.ceil(limit / (isAdmin ? 5 : 3)),
            orderBy: { createdAt: 'desc' },
            where: authorFilter,
            include: { author: true, category: true, _count: { select: { comments: true } } }
        }),
        prisma.comment.findMany({
            take: Math.ceil(limit / (isAdmin ? 5 : 3)),
            orderBy: { createdAt: 'desc' },
            where: isAdmin ? {} : { authorId: session.userId },
            include: { author: true, article: true, forum: true }
        }),
        isAdmin ? prisma.user.findMany({
            take: Math.ceil(limit / 5),
            orderBy: { createdAt: 'desc' },
        }) : Promise.resolve([]),
        isAdmin ? prisma.event.findMany({
            take: Math.ceil(limit / 5),
            orderBy: { createdAt: 'desc' },
            where: { date: { gte: new Date() } }
        }) : Promise.resolve([]),
        isAdmin ? prisma.galleryItem.findMany({
            take: Math.ceil(limit / 5),
            orderBy: { createdAt: 'desc' }
        }) : Promise.resolve([]),
        prisma.article.findMany({
            take: myLimit,
            orderBy: { createdAt: 'desc' },
            where: { authorId: session.userId }
        }),
        prisma.forum.findMany({
            take: myLimit,
            orderBy: { createdAt: 'desc' },
            where: { authorId: session.userId },
            include: { _count: { select: { comments: true } } }
        }),
        prisma.comment.findMany({
            take: myLimit,
            orderBy: { createdAt: 'desc' },
            where: { authorId: session.userId },
            include: { article: true, forum: true }
        }),
        isAdmin ? Promise.all([
            prisma.article.count(),
            prisma.forum.count(),
            prisma.user.count(),
            prisma.comment.count(),
            prisma.event.count(),
            prisma.galleryItem.count()
        ]) : Promise.all([
            prisma.article.count({ where: { authorId: session.userId } }),
            prisma.forum.count({ where: { authorId: session.userId } }),
            prisma.comment.count({ where: { authorId: session.userId } }),
            prisma.user.count(),
            prisma.event.count(),
            prisma.galleryItem.count()
        ])
    ]);

    // Map and serialize data for the client component
    const activities = [
        ...recentArticles.map(item => ({
            id: `article-${item.id}`,
            type: 'article' as const,
            title: item.title,
            description: item.excerpt || item.title,
            createdAt: item.createdAt.toISOString(),
            date: item.createdAt.toISOString(),
            author: item.anonymous ? { id: '', name: 'Anonim', avatar: null } : item.author,
            category: item.category,
            url: `/writings/${item.slug}`,
            icon: '📝'
        })),
        ...recentForums.map(item => ({
            id: `forum-${item.id}`,
            type: 'forum' as const,
            title: item.title,
            description: item.content.substring(0, 100),
            createdAt: item.createdAt.toISOString(),
            date: item.createdAt.toISOString(),
            author: item.author,
            category: item.category,
            url: `/forums/${item.id}`,
            icon: '💬',
            commentsCount: item._count.comments
        })),
        ...recentComments.map(item => ({
            id: `comment-${item.id}`,
            type: 'comment' as const,
            title: item.article ? `Komentar di "${item.article.title}"` : `Komentar di opini`,
            description: item.content.substring(0, 100),
            createdAt: item.createdAt.toISOString(),
            date: item.createdAt.toISOString(),
            author: item.author,
            url: item.article ? `/writings/${item.article.slug}#comment-${item.id}` : `/forums/${item.forum?.id}#comment-${item.id}`,
            icon: '💭'
        })),
        ...recentUsers.map(item => ({
            id: `user-${item.id}`,
            type: 'user' as const,
            title: `${item.name} bergabung`,
            description: item.bio || `Pengguna baru`,
            createdAt: item.createdAt.toISOString(),
            date: item.createdAt.toISOString(),
            author: item,
            url: `/profile/${item.id}`,
            icon: '👤'
        })),
        ...recentEvents.map(item => ({
            id: `event-${item.id}`,
            type: 'event' as const,
            title: item.title,
            description: item.description.substring(0, 100),
            createdAt: item.createdAt.toISOString(),
            date: item.date.toISOString(),
            url: '/events',
            icon: '📅',
            location: item.location,
            eventDate: item.date.toISOString()
        })),
        ...recentGallery.map(item => ({
            id: `gallery-${item.id}`,
            type: 'gallery' as const,
            title: item.category ? `Galeri: ${item.category}` : 'Galeri',
            description: '',
            createdAt: item.createdAt.toISOString(),
            date: item.createdAt.toISOString(),
            url: item.url,
            icon: '🖼️',
            location: item.category
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .slice(0, limit);

    const [articleCount, forumCount, userCount, commentCount, eventCount, galleryCount] = statsData;

    const initialData = {
        activities: activities as any,
        stats: {
            articles: articleCount,
            forums: forumCount,
            users: userCount,
            comments: commentCount,
            events: eventCount,
            gallery: galleryCount
        },
        my: {
            articles: myArticles.map(a => ({
                id: a.id,
                title: a.title,
                slug: a.slug,
                createdAt: a.createdAt.toISOString(),
                visibility: a.visibility,
                published: a.published,
                scheduledAt: a.scheduledAt?.toISOString() || null
            })),
            forums: myForums.map(f => ({
                id: f.id,
                title: f.title,
                createdAt: f.createdAt.toISOString(),
                commentsCount: f._count.comments
            })),
            comments: myComments.map(c => ({
                id: c.id,
                content: c.content,
                createdAt: c.createdAt.toISOString(),
                article: c.article ? { id: c.article.id, title: c.article.title, slug: c.article.slug } : null,
                forum: c.forum ? { id: c.forum.id, title: c.forum.title } : null
            })),
        },
        isAdmin,
        statsType: (isAdmin ? 'global' : 'personal') as 'global' | 'personal'
    };

    return <DashboardContent initialData={initialData} />;
}
