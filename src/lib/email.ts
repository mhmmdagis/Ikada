export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Disada',
          email: process.env.FROM_EMAIL || 'noreply@disada.com',
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Brevo API error:', data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export function generateVerificationEmailHtml(token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verifikasi Email - Disada</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2ec4b6;">Disada</h1>
          <p style="color: #666;">Verifikasi Email Anda</p>
        </div>

        <div style="background: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; color: #333;">Selamat datang di Disada!</h2>
          <p>Terima kasih telah mendaftar. Untuk melanjutkan, silakan verifikasi email Anda dengan mengklik tombol di bawah ini:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background: #2ec4b6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Verifikasi Email
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            Jika tombol tidak berfungsi, salin dan tempel link berikut ke browser Anda:<br>
            <a href="${verificationUrl}" style="color: #2ec4b6; word-break: break-all;">${verificationUrl}</a>
          </p>
        </div>

        <div style="text-align: center; color: #666; font-size: 12px;">
          <p>Email ini dikirim secara otomatis. Jika Anda tidak mendaftar, abaikan email ini.</p>
        </div>
      </body>
    </html>
  `;
}

export function generatePasswordResetEmailHtml(token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Password - Disada</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2ec4b6;">Disada</h1>
          <p style="color: #666;">Reset Password</p>
        </div>

        <div style="background: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; color: #333;">Reset Password Anda</h2>
          <p>Kami menerima permintaan reset password untuk akun Anda. Klik tombol di bawah untuk membuat password baru:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: #2ec4b6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            Jika tombol tidak berfungsi, salin dan tempel link berikut ke browser Anda:<br>
            <a href="${resetUrl}" style="color: #2ec4b6; word-break: break-all;">${resetUrl}</a>
          </p>

          <p style="color: #ff6b6b; font-size: 14px; font-weight: bold;">
            Link ini akan kadaluarsa dalam 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.
          </p>
        </div>

        <div style="text-align: center; color: #666; font-size: 12px;">
          <p>Email ini dikirim secara otomatis dari Disada.</p>
        </div>
      </body>
    </html>
  `;
}