import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token wajib diisi.' }, { status: 400 });
    }

    // Find user with verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Token verifikasi tidak valid.' }, { status: 400 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email sudah diverifikasi.' }, { status: 400 });
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email berhasil diverifikasi. Anda sekarang dapat login.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan.' }, { status: 500 });
  }
}