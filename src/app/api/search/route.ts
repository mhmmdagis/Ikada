import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        results: {
          articles: [],
          forums: [],
          users: [],
          events: []
        },
        total: 0
      });
    }

    // Search in multiple models simultaneously (Categories removed per user request)
    const [articles, forums, users, events] = await Promise.all([
      // Search articles
      prisma.article.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          thumbnail: true,
          anonymous: true,
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
              slug: true,
              color: true
            }
          }
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      }),

      // Search forums (Improved with author name search)
      prisma.forum.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { 
              author: { 
                name: { contains: query, mode: 'insensitive' } 
              } 
            }
          ]
        },
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
              slug: true,
              color: true
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true
            }
          }
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      }),

      // Search users
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { username: { contains: query, mode: 'insensitive' } },
            { bio: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          username: true,
          bio: true,
          avatar: true,
          role: true,
          createdAt: true
        },
        take: 8,
        orderBy: { createdAt: 'desc' }
      }),

      // Search events
      prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
            { organizer: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          date: true,
          endDate: true,
          image: true,
          createdAt: true,
          organizer: true
        },
        take: 8,
        orderBy: { date: 'asc' }
      })
    ]);

    const total = articles.length + forums.length + users.length + events.length;

    return NextResponse.json({
      success: true,
      query,
      results: {
        articles,
        forums,
        users,
        events
      },
      counts: {
        articles: articles.length,
        forums: forums.length,
        users: users.length,
        events: events.length
      },
      total
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan saat mencari.'
    }, { status: 500 });
  }
}