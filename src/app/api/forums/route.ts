import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET(req: NextRequest) {
    noStore();
    const { searchParams } = new URL(req.url);
    const cat = searchParams.get('cat');
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [forums, total] = await Promise.all([
        prisma.forum.findMany({
            where: {
                ...(cat ? { category: { slug: cat } } : {}),
                ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { content: { contains: q, mode: 'insensitive' } }] } : {}),
            },
            select: {
                id: true,
                title: true,
                content: true,
                views: true,
                pinned: true,
                createdAt: true,
                updatedAt: true,
                author: { select: { id: true, name: true, avatar: true } },
                category: { select: { id: true, name: true, slug: true, color: true } },
                _count: { select: { comments: true, likes: true } },
            },
            orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
            take: limit,
            skip: skip,
        }),
        prisma.forum.count({
            where: {
                ...(cat ? { category: { slug: cat } } : {}),
                ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { content: { contains: q, mode: 'insensitive' } }] } : {}),
            }
        })
    ]);

    return NextResponse.json({
        data: forums,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const { title, content, categoryId } = await req.json();

    if (!title?.trim() || !content?.trim()) {
        return NextResponse.json({ error: 'Judul dan isi wajib diisi.' }, { status: 400 });
    }

    const forum = await prisma.forum.create({
        data: {
            title: title.trim(),
            content: content.trim(),
            authorId: session.userId!,
            categoryId: categoryId || null,
        },
        include: { author: true },
    });

    return NextResponse.json(forum, { status: 201 });
}
