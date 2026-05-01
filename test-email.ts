import dotenv from 'dotenv';
import { sendEmail } from './src/lib/email';

dotenv.config({ path: '.env' });

async function testEmail() {
  try {
    console.log('Testing Brevo Email via sendEmail() helper...');
    const result = await sendEmail(
      'rb.nawawi29@gmail.com',
      'Test Email - Disada',
      `<h2>Test Email Brevo</h2><p>Waktu: ${new Date().toISOString()}</p>`
    );

    if (!result.success) {
      console.log('❌ sendEmail failed:', result.error);
    } else {
      console.log('✅ sendEmail success:', result.data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmail();
