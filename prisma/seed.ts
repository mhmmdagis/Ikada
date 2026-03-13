import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // Clean existing data
    await prisma.comment.deleteMany()
    await prisma.like.deleteMany()
    await prisma.galleryItem.deleteMany()
    await prisma.program.deleteMany()
    await prisma.forum.deleteMany()
    await prisma.article.deleteMany()
    await prisma.event.deleteMany()
    await prisma.user.deleteMany()

    console.log('Deleted old data.')

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10)
    const userPassword = await bcrypt.hash('user123', 10)

    // 1. Create Users
    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            name: 'Admin Wacana Muda',
            email: 'admin@wacanamuda.com',
            password: adminPassword,
            role: 'ADMIN',
            bio: 'Administrator platform Wacana Muda',
            avatar: '',
            instagram: '',
            twitter: '',
            linkedin: '',
        }
    })

    const author1 = await prisma.user.create({
        data: {
            username: 'akhdan',
            name: 'Akhdan Fadhil',
            email: 'akhdan@example.com',
            password: userPassword,
            role: 'USER',
            bio: 'Penulis lepas dan penggemar literatur.',
            avatar: '',
            instagram: '',
            twitter: '',
            linkedin: '',
        }
    })

    const author2 = await prisma.user.create({
        data: {
            username: 'sultan',
            name: 'Sultan Pamungkas',
            email: 'sultan@example.com',
            password: userPassword,
            role: 'USER',
            bio: 'Pengamat sosial dan budaya pop.',
            avatar: '',
            instagram: '',
            twitter: '',
            linkedin: '',
        }
    })

    console.log('Users created.')

    // 2. Create Articles (Writings)
    await prisma.article.create({
        data: {
            title: 'Memahami Kekuatan Lateral Thinking',
            slug: 'memahami-kekuatan-lateral-thinking',
            content: 'Pernahkah Anda merasa buntu saat menghadapi masalah yang rumit, padahal sudah menggunakan semua cara yang biasa dilakukan? \n\nSejak masa sekolah, otak kita dididik untuk terbiasa mengenali pola (pattern recognition) dan menyelesaikan masalah secara linier alias vertical thinking. Padahal seringkali pemecahan masalah justru butuh sudut pandang menyamping.',
            published: true,
            authorId: author1.id,
        }
    })

    await prisma.article.create({
        data: {
            title: 'Dunning-Kruger Effect: Ketika Sedikit Tahu Merasa Paling Hebat',
            slug: 'dunning-kruger-effect-ketika-sedikit-tahu-merasa-paling-hebat',
            content: 'Semakin banyak seseorang belajar, semakin ia sadar bahwa dirinya belum tahu apa-apa. Namun, ketika pengetahuan masih dangkal, rasa percaya diri justru melonjak tinggi.\n\nSeringkali kita menemui orang yang baru belajar sedikit tentang suatu hal, tetapi sudah merasa paling mengerti segalanya. Inilah bias kognitif yang disebut Dunning-Kruger Effect.',
            published: true,
            authorId: author2.id,
        }
    })

    await prisma.article.create({
        data: {
            title: 'Antara Ambisi, Realitas, dan Bahaya Jalan Pintas',
            slug: 'antara-ambisi-realitas-dan-bahaya-jalan-pintas',
            content: 'Media sosial sering menampilkan ilusi kesuksesan instan yang menekan banyak orang merasa gagal jika belum cepat berhasil. Artikel ini membahas realitas dari sebuah proses pencapaian.\n\nDi era digital saat ini, media sosial sering kali membanjiri kita dengan gambaran kesuksesan yang instan dan gemerlap.',
            published: true,
            authorId: author1.id,
        }
    })

    console.log('Articles created.')

    // 3. Create Events
    await prisma.event.create({
        data: {
            title: 'Webinar Jurnalistik Era Digital',
            description: 'Pelatihan menulis opini dan esai untuk pemuda bersama jurnalis senior.',
            date: new Date('2026-03-15T14:00:00Z'),
            location: 'Zoom / Online',
        }
    })

    await prisma.event.create({
        data: {
            title: 'Diskusi Panel: Lateral Thinking dalam Karir',
            description: 'Bagaimana menerapkan pemikiran lateral untuk memecahkan masalah di dunia profesional.',
            date: new Date('2026-04-05T09:00:00Z'),
            location: 'Auditorium Perpustakaan Nasional, Jakarta',
        }
    })

    console.log('Events created.')

    // 6. Create Programs
    await prisma.program.createMany({
        data: [
            {
                title: 'Silaturahmi Akbar',
                description: 'Mempertemukan ratusan alumni dalam satu acara kebersamaan untuk mempererat ikatan persaudaraan.',
                content: 'Program Silaturahmi Akbar adalah acara tahunan yang menghadirkan seluruh alumni IKADA dalam satu forum besar. Acara ini menjadi momentum penting untuk bertukar pengalaman, membangun networking, dan memperkuat solidaritas antar alumni.',
                category: 'Sosial',
                status: 'ACTIVE',
                createdById: admin.id,
            },
            {
                title: 'Pengembangan Alumni',
                description: 'Mengadakan seminar, diskusi, dan pelatihan untuk meningkatkan kualitas SDM alumni.',
                content: 'Program ini fokus pada pengembangan kompetensi alumni melalui berbagai kegiatan edukasi seperti seminar, workshop, dan pelatihan keterampilan. Kami berkolaborasi dengan berbagai pihak untuk memberikan materi yang relevan dengan kebutuhan dunia kerja saat ini.',
                category: 'Edukasi',
                status: 'ACTIVE',
                createdById: admin.id,
            },
            {
                title: 'Bakti Sosial',
                description: 'Berkontribusi langsung kepada masyarakat melalui kegiatan kurban dan program sosial lainnya.',
                content: 'Melalui program Bakti Sosial, IKADA berkomitmen untuk memberikan kontribusi nyata kepada masyarakat. Kegiatan ini mencakup program kurban, bantuan sosial, dan berbagai kegiatan kemanusiaan lainnya yang bermanfaat bagi masyarakat sekitar.',
                category: 'Sosial',
                status: 'ACTIVE',
                createdById: admin.id,
            },
        ]
    })

    console.log('Programs created.')
    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
