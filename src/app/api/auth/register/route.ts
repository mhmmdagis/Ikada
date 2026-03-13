import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendEmail, generateVerificationEmailHtml } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password minimal 6 karakter.' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        // use name as username (simple slug) by lowercasing and removing spaces
        const username = name.trim().toLowerCase().replace(/\s+/g, '_');

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await prisma.user.create({
            data: {
                username,
                name,
                email,
                password: hashedPassword,
                role: 'USER',
                emailVerificationToken: verificationToken,
            },
        });

        // Send verification email
        const emailHtml = generateVerificationEmailHtml(verificationToken);
        const emailResult = await sendEmail(email, 'Verifikasi Email - Disada', emailHtml);

        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
            // Still create user but log the error
        }

        return NextResponse.json({
            success: true,
            message: 'Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi.',
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error('[REGISTER ERROR]', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
    }
}
