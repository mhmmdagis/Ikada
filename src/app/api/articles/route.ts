import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { unstable_noStore as noStore } from 'next/cache';

function slugify(text: string) {
    return text.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        + '-' + Date.now();
}

export async function GET(req: NextRequest) {
    noStore();
    const { searchParams } = new URL(req.url);
    const cat = searchParams.get('cat');
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const now = new Date();
    const [articles, total] = await Promise.all([
        prisma.article.findMany({
            where: {
                published: true,
                visibility: 'PUBLIC',
                AND: [
                    { OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }] },
                ],
                ...(cat ? { category: { slug: cat } } : {}),
                ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { excerpt: { contains: q, mode: 'insensitive' } }] } : {}),
            },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                cover: true,
                thumbnail: true,
                published: true,
                views: true,
                createdAt: true,
                author: { select: { id: true, name: true, avatar: true } },
                category: { select: { id: true, name: true, slug: true, color: true } },
                _count: { select: { likes: true, comments: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: skip,
        }),
        prisma.article.count({
            where: {
                published: true,
                visibility: 'PUBLIC',
                AND: [
                    { OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }] },
                ],
                ...(cat ? { category: { slug: cat } } : {}),
                ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { excerpt: { contains: q, mode: 'insensitive' } }] } : {}),
            }
        })
    ]);

    return NextResponse.json({
        data: articles,
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

    const {
        title,
        excerpt,
        content,
        categoryId,
        tags,
        thumbnail,
        visibility,
        scheduledAt,
        allowComments,
        anonymous,
        metaTitle,
        metaDescription,
        customSlug,
        attachments,
    } = await req.json();

    if (!title?.trim() || !content?.trim()) {
        return NextResponse.json({ error: 'Judul dan isi wajib diisi.' }, { status: 400 });
    }

    const slug = customSlug?.trim() || slugify(title);
    // published = true jika visibility PUBLIC atau UNLISTED
    // published = false jika visibility DRAFT atau PRIVATE
    const isPublished = visibility && (visibility === 'PUBLIC' || visibility === 'UNLISTED') || !visibility;
    const scheduleDate = scheduledAt ? new Date(scheduledAt) : null;

    const article = await prisma.article.create({
        data: {
            title: title.trim(),
            slug,
            customSlug: customSlug?.trim() || null,
            excerpt: excerpt?.trim() || null,
            content: content.trim(),
            thumbnail: thumbnail || null,
            visibility: visibility || 'PUBLIC',
            scheduledAt: scheduleDate,
            allowComments: allowComments !== undefined ? allowComments : true,
            anonymous: !!anonymous,
            metaTitle: metaTitle?.trim() || null,
            metaDescription: metaDescription?.trim() || null,
            tags: tags || [],
            attachments: attachments || [],
            published: isPublished,
            authorId: session.userId!,
            categoryId: categoryId || null,
        },
    });

    return NextResponse.json(article, { status: 201 });
}
