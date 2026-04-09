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

        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedName = String(name).trim();

        // Basic email format validation (avoid sending verification to malformed email)
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
        if (!emailOk) {
            return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password minimal 6 karakter.' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
            return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        // use name as username (simple slug) by lowercasing and removing spaces
        let baseUsername = normalizedName.toLowerCase().replace(/\s+/g, '_');
        let username = baseUsername;
        let suffix = 1;

        // Ensure username is unique
        while (true) {
            const existingUsername = await prisma.user.findUnique({
                where: { username },
            });
            if (!existingUsername) break;
            username = `${baseUsername}${suffix++}`;
            if (suffix > 1000) {
                return NextResponse.json({ error: 'Gagal membuat username unik.' }, { status: 500 });
            }
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await prisma.user.create({
            data: {
                username,
                name: normalizedName,
                email: normalizedEmail,
                password: hashedPassword,
                role: 'USER',
                emailVerificationToken: verificationToken,
            },
        });

        // Send verification email
        const emailHtml = generateVerificationEmailHtml(verificationToken);
        const emailResult = await sendEmail(normalizedEmail, 'Verifikasi Email - Disada', emailHtml);

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
