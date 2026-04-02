import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session.isLoggedIn) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

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

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ext = file.name.substring(file.name.lastIndexOf('.'));
        const filename = `disada-${timestamp}-${randomStr}${ext}`;

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: 'private',
        });

        // Return URL
        return NextResponse.json({ url: blob.url, success: true });
    } catch (error) {
        console.error('[UPLOAD ERROR]', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
