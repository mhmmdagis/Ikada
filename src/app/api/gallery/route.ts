import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { put } from '@vercel/blob';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const categoryId = searchParams.get('categoryId');

    const [items, total] = await Promise.all([
      prisma.galleryItem.findMany({
        where: categoryId ? { categoryId } : {},
        select: {
          id: true,
          url: true,
          category: true,
          categoryId: true,
          createdAt: true,
          uploadedBy: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip,
      }),
      prisma.galleryItem.count({
        where: categoryId ? { categoryId } : {}
      })
    ]);

    return NextResponse.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[GALLERY GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('categoryId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Generate unique filename for gallery
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.substring(file.name.lastIndexOf('.'));
    const filename = `gallery-${timestamp}-${randomStr}${ext}`;

    // Upload to Vercel Blob Storage
    const blob = await put(filename, file, {
      access: 'public',
    });

    // Save record to database with Blob URL
    const gallery = await prisma.galleryItem.create({
      data: {
        url: blob.url,
        categoryId: categoryId || null,
        uploadedById: user.id
      }
    });

    return NextResponse.json({ 
      success: true, 
      gallery: {
        id: gallery.id,
        url: gallery.url,
        categoryId: gallery.categoryId,
        createdAt: gallery.createdAt,
        uploadedById: gallery.uploadedById
      }
    });
  } catch (error) {
    console.error('[GALLERY POST ERROR]', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
