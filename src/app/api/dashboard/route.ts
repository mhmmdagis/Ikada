import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({
        success: false,
        error: 'Anda harus login untuk mengakses dashboard.'
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const myLimit = parseInt(searchParams.get('myLimit') || '10');

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User tidak ditemukan.'
      }, { status: 404 });
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    // Build where clauses based on user role
    const authorFilter = isAdmin ? {} : { authorId: session.userId };

    // Get recent activities (personal for normal users; full for admins)
    const [recentArticles, recentForums, recentComments, recentUsers, recentEvents, recentGallery] = await Promise.all([
      prisma.article.findMany({
        take: Math.ceil(limit / (isAdmin ? 5 : 3)),
        orderBy: { createdAt: 'desc' },
        where: authorFilter,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          anonymous: true,
          createdAt: true,
          visibility: true,
          scheduledAt: true,
          published: true,
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true
            }
          }
        }
      }),

      prisma.forum.findMany({
        take: Math.ceil(limit / (isAdmin ? 5 : 3)),
        orderBy: { createdAt: 'desc' },
        where: authorFilter,
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        }
      }),

      prisma.comment.findMany({
        take: Math.ceil(limit / (isAdmin ? 5 : 3)),
        orderBy: { createdAt: 'desc' },
        where: isAdmin ? {} : { authorId: session.userId },
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true
            }
          },
          article: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          },
          forum: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }),

      isAdmin ? prisma.user.findMany({
        take: Math.ceil(limit / 5),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          bio: true,
          createdAt: true
        }
      }) : Promise.resolve([]),

      isAdmin ? prisma.event.findMany({
        take: Math.ceil(limit / 5),
        orderBy: { createdAt: 'desc' },
        where: {
          date: {
            gte: new Date()
          }
        },
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          location: true,
          image: true,
          createdAt: true
        }
      }) : Promise.resolve([]),

      isAdmin ? prisma.galleryItem.findMany({
        take: Math.ceil(limit / 5),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          url: true,
          category: true,
          createdAt: true
        }
      }) : Promise.resolve([])
    ]);

    // "My content" lists for grouping inside dashboard UI (always based on current user)
    const [myArticles, myForums, myComments] = await Promise.all([
      prisma.article.findMany({
        take: myLimit,
        orderBy: { createdAt: 'desc' },
        where: { authorId: session.userId },
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          visibility: true,
          published: true,
          scheduledAt: true,
        }
      }),
      prisma.forum.findMany({
        take: myLimit,
        orderBy: { createdAt: 'desc' },
        where: { authorId: session.userId },
        select: {
          id: true,
          title: true,
          createdAt: true,
          _count: { select: { comments: true } }
        }
      }),
      prisma.comment.findMany({
        take: myLimit,
        orderBy: { createdAt: 'desc' },
        where: { authorId: session.userId },
        select: {
          id: true,
          content: true,
          createdAt: true,
          article: { select: { id: true, title: true, slug: true } },
          forum: { select: { id: true, title: true } },
        }
      }),
    ]);

    // Combine and sort all activities by createdAt/date
    const activities = [
      ...recentArticles.map(item => ({
        id: `article-${item.id}`,
        type: 'article' as const,
        title: item.title,
        description: item.excerpt || item.title,
        createdAt: item.createdAt,
        date: item.createdAt,
        author: item.anonymous ? { id: '', name: 'Anonim', username: '', avatar: null } : item.author,
        category: item.category,
        url: `/writings/${item.slug}`,
        icon: '📝'
      })),
      ...recentForums.map(item => ({
        id: `forum-${item.id}`,
        type: 'forum' as const,
        title: item.title,
        description: item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''),
        createdAt: item.createdAt,
        date: item.createdAt,
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
        description: item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''),
        createdAt: item.createdAt,
        date: item.createdAt,
        author: item.author,
        url: item.article ? `/writings/${item.article.slug}#comment-${item.id}` : `/forums/${item.forum?.id}#comment-${item.id}`,
        icon: '💭'
      })),
      ...recentUsers.map(item => ({
        id: `user-${item.id}`,
        type: 'user' as const,
        title: `${item.name} bergabung`,
        description: item.bio || `Pengguna baru @${item.username}`,
        createdAt: item.createdAt,
        date: item.createdAt,
        author: item,
        url: `/profile/${item.id}`,
        icon: '👤'
      })),
      ...recentEvents.map(item => ({
        id: `event-${item.id}`,
        type: 'event' as const,
        title: item.title,
        description: item.description.substring(0, 100) + (item.description.length > 100 ? '...' : ''),
        createdAt: item.createdAt,
        date: item.date,
        url: '/events',
        icon: '📅',
        location: item.location,
        eventDate: item.date
      })),
      ...recentGallery.map(item => ({
        id: `gallery-${item.id}`,
        type: 'gallery' as const,
        title: item.category ? `Galeri: ${item.category}` : 'Galeri',
        description: '',
        createdAt: item.createdAt,
        date: item.createdAt,
        url: item.url,
        icon: '🖼️',
        location: item.category
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .slice(0, limit);

    // Get statistics
    const stats = isAdmin ? await Promise.all([
      prisma.article.count(),
      prisma.forum.count(),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.event.count(),
      prisma.galleryItem.count()
    ]) : await Promise.all([
      prisma.article.count({ where: { authorId: session.userId } }),
      prisma.forum.count({ where: { authorId: session.userId } }),
      prisma.comment.count({ where: { authorId: session.userId } }),
      prisma.user.count(),
      prisma.event.count(),
      prisma.galleryItem.count()
    ]);

    const [articleCount, forumCount, userCount, commentCount, eventCount, galleryCount] = stats;

    return NextResponse.json({
      success: true,
      activities,
      stats: {
        articles: articleCount,
        forums: forumCount,
        users: userCount,
        comments: commentCount,
        events: eventCount,
        gallery: galleryCount
      },
      my: {
        articles: myArticles,
        forums: myForums.map(f => ({ ...f, commentsCount: f._count.comments })),
        comments: myComments,
      },
      isAdmin,
      statsType: isAdmin ? 'global' : 'personal'
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan saat memuat dashboard.'
    }, { status: 500 });
  }
}
