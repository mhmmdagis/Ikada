import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Load env from .env.local (where DATABASE_URL is defined)
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Super admin account (one-time)
    const email = 'rb.nawawi29@gmail.com';
    const name = 'Super Admin Disada';
    const plainPassword = 'Admin_123';

    console.log('Using DATABASE_URL =', process.env.DATABASE_URL);
    console.log('Creating admin for:', email);

    // Cek apakah email sudah terdaftar
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    const passwordHash = await bcrypt.hash(plainPassword, 10);
    
    if (existingByEmail) {
      // Upgrade user yang sudah ada menjadi ADMIN
      const updated = await prisma.user.update({
        where: { email },
        data: {
          name,
          role: 'SUPER_ADMIN',
          password: passwordHash,
          emailVerified: true,
        },
      });

      console.log('✅ User sudah ada, role diubah ke ADMIN.');
      console.log('📋 Detail Admin:');
      console.log(`   - Username: ${updated.username}`);
      console.log(`   - Name: ${updated.name}`);
      console.log(`   - Email: ${updated.email}`);
      console.log(`   - Password Default (baru): ${plainPassword}`);
      console.log(`   - Role: ${updated.role}`);
      return;
    }

    // Generate username unik berbasis "admin"
    let baseUsername = 'admin';
    let candidate = baseUsername;
    let suffix = 1;

    // Loop sampai menemukan username yang belum dipakai
    // (dibatasi agar tidak infinite loop)
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existingByUsername = await prisma.user.findUnique({
        where: { username: candidate },
      });
      if (!existingByUsername) break;
      candidate = `${baseUsername}${suffix++}`;
      if (suffix > 100) {
        throw new Error('Terlalu banyak username admin yang sudah dipakai.');
      }
    }

    const newAdmin = await prisma.user.create({
      data: {
        username: candidate,
        name,
        email,
        password: passwordHash,
        role: 'SUPER_ADMIN',
        emailVerified: true,
        bio: 'Super Administrator Disada',
        avatar: '',
        instagram: '',
        twitter: '',
        linkedin: '',
      },
    });

    console.log('✅ Admin berhasil dibuat!');
    console.log('📋 Detail Admin:');
    console.log(`   - Username: ${newAdmin.username}`);
    console.log(`   - Name: ${newAdmin.name}`);
    console.log(`   - Email: ${newAdmin.email}`);
    console.log(`   - Password Default: ${plainPassword}`);
    console.log(`   - Role: ${newAdmin.role}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
