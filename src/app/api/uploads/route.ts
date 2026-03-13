import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            return NextResponse.json([]);
        }
        const files = fs.readdirSync(uploadsDir).filter(f => {
            const ext = path.extname(f).toLowerCase();
            // include common image and video extensions
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.ogg'].includes(ext);
        });
        const urls = files.map(f => `/uploads/${f}`);
        return NextResponse.json(urls);
    } catch (err) {
        console.error('[UPLOADS LIST ERROR]', err);
        return NextResponse.json({ error: 'Failed to read uploads' }, { status: 500 });
    }
}