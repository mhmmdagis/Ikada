import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendEmail, generateVerificationEmailHtml } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi.' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'Jika email terdaftar, link verifikasi akan dikirim.'
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email sudah diverifikasi.' }, { status: 400 });
    }

    // Generate NEW verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
      },
    });

    // Send verification email
    const emailHtml = generateVerificationEmailHtml(verificationToken);
    const emailResult = await sendEmail(normalizedEmail, 'Verifikasi Email - Disada', emailHtml);

    if (!emailResult.success) {
      console.error('Failed to resend verification email:', emailResult.error);
      return NextResponse.json({ 
        error: 'Gagal mengirim email verifikasi. Pastikan konfigurasi Brevo sudah benar.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Link verifikasi baru telah dikirim ke email Anda.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
