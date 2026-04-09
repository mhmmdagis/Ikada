import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function testEmail() {
  try {
    console.log('Testing Brevo Email...');
    console.log('API Key:', process.env.BREVO_API_KEY?.substring(0, 10) + '...');
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
    
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
        to: [{ email: 'rb.nawawi29@gmail.com' }],
        subject: 'Test Email - Disada dengan Brevo',
        htmlContent: `
          <h2>Test Email Brevo</h2>
          <p>Ini adalah email test dari Disada menggunakan Brevo.</p>
          <p>Jika Anda menerima email ini, berarti Brevo API sudah bekerja!</p>
          <p>Waktu: ${new Date().toISOString()}</p>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ Error:', data);
    } else {
      console.log('✅ Email BERHASIL dikirim!');
      console.log('Email ID:', data.messageId);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmail();
