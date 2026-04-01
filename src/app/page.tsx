import Link from 'next/link';
import ArticleAuthor from '@/components/ArticleAuthor';
import AuthorLink from '@/components/AuthorLink';
import { ArrowRight, BookOpen, MessageSquare, Calendar, Star, Image, Users, TrendingUp } from 'lucide-react';
import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import styles from './page.module.css';

export default async function Home() {
  noStore();

  const [articles, forums, galleryItems, programs, totalUsers] = await Promise.all([
    prisma.article.findMany({
      where: { published: true },
      include: { author: true, category: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
    prisma.forum.findMany({
      include: { author: true, _count: { select: { comments: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    }),
    prisma.galleryItem.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { uploadedBy: { select: { name: true } } }
    }),
    prisma.program.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.user.count(),
  ]);

  const totalArticles = await prisma.article.count({ where: { published: true } });
  const totalForums = await prisma.forum.count();

  return (
    <div className={styles.page}>

      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <h1 className={`${styles.heroTitle} animate-fade-up delay-1`}>
                Selamat Datang di Website Resmi Disada (Diskusi Bareng IKADA) Jabodetabek-Banten
              </h1>
              <p className={`${styles.heroSub} animate-fade-up delay-2`}>
                Menyatukan Asa, Mempererat Silaturahmi, Bangkit Bersama
              </p>
            </div>
            
            <div className={`${styles.heroImageWrap} animate-fade-up delay-3`}>
              <div className={styles.heroImageGlow} />
              <img 
                src="/ikada-logo.png" 
                alt="Logo IKADA" 
                className={styles.heroImage}
                draggable="false"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== INTRO ===== */}
      <section className={styles.intro}>
        <div className="container">
          <h2 className="text-2xl font-semibold mb-4">Tentang IKADA</h2>
          <p>
            Ikatan Keluarga Alumni Darussalam (IKADA) Jabodetabek-Banten adalah rumah bagi seluruh alumni Pondok Pesantren Darussalam Ciamis yang berdomisili di wilayah Jakarta, Bogor, Depok, Tangerang, Bekasi, dan Banten. Didirikan atas dasar semangat kekeluargaan, kami berkomitmen untuk menjadi wadah yang mempererat tali persaudaraan, membangun potensi alumni, dan memberikan kontribusi positif bagi almamater serta masyarakat luas.
          </p>
          <Link href="/about" className="btn btn-primary btn-sm mt-4">Lebih Lanjut</Link>
        </div>
      </section>

      {/* ===== VISION ===== */}
      <section className={styles.vision}>
        <div className="container">
          <h2 className="text-2xl font-semibold mb-4">Visi Kami</h2>
          <p>
            Menjadi organisasi alumni yang kuat dan solid, bergerak bersama untuk mewujudkan masyarakat yang sejahtera, terbuka, dan berkeadilan, sambil terus menumbuhkembangkan dan mempererat ikatan silaturahmi antar sesama alumni.
          </p>
        </div>
      </section>

      {/* ===== PROGRAM ===== */}
      {programs.length > 0 && (
        <section className={styles.program}>
          <div className="container">
            <h2 className="text-2xl font-semibold mb-4">Program Unggulan Kami</h2>
            <div className={styles.programGrid}>
              {programs.map(program => (
                <div key={program.id} className={styles.programCard}>
                  {program.image && (
                    <img
                      src={program.image}
                      alt={program.title}
                      className={styles.programImage}
                    />
                  )}
                  <div className={styles.programContent}>
                    <h3 className={styles.programTitle}>{program.title}</h3>
                    <p className={styles.programDesc}>{program.description}</p>
                    {program.category && (
                      <span className="badge badge-primary">{program.category}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/program" className="btn btn-secondary btn-sm mt-4">Lihat Semua Program</Link>
          </div>
        </section>
      )}

      {/* ===== FEATURES ===== */}
      <section className={styles.features}>
        <div className="container">
          <div className="section-header animate-fade-up">
            <span className="section-eyebrow">Fitur Kami</span>
            <h2>4 Pilar <span className="text-gradient">Utama</span> Disada</h2>
            <p>Semua yang kamu butuhkan untuk berkarya, berdiskusi, dan berkembang ada di sini.</p>
          </div>

          <div className={styles.featureGrid}>
            {[
              {
                icon: <BookOpen size={28} />,
                color: 'var(--brand-primary)',
                bg: 'rgba(46, 196, 182,.1)',
                title: 'Ruang Kata',
                desc: 'Artikel dan opini tajam dari penulis muda. Wadah mengekspresikan pemikiran kritis tentang isu-isu terkini.',
                link: '/writings',
                label: 'Jelajahi Tulisan',
              },
              {
                icon: <MessageSquare size={28} />,
                color: 'var(--brand-secondary)',
                bg: 'rgba(27, 154, 170,.1)',
                title: 'Ruang Diskusi',
                desc: 'Forum interaktif untuk bertukar ide. Jangan hanya membaca – ikutlah beropini dalam diskusi yang membangun.',
                link: '/forums',
                label: 'Ikut Diskusi',
              },
              {
                icon: <Calendar size={28} />,
                color: 'var(--brand-accent)',
                bg: 'rgba(255, 214, 10,.1)',
                title: 'Jejak Karya',
                desc: 'Event, webinar, dan kompetisi terkurasi untuk meningkatkan skill dan jaringan profesional kamu.',
                link: '/events',
                label: 'Lihat Event',
              },
              {
                icon: <Star size={28} />,
                color: 'var(--brand-emerald)',
                bg: 'rgba(46, 196, 182,.1)',
                title: 'Program Kerja',
                desc: 'Berbagai program sosial dan pengembangan yang dirancang untuk anggota IKADA.',
                link: '/program',
                label: 'Program Kami',
              },
            ].map((f, i) => (
              <div key={i} className={`card ${styles.featureCard} animate-fade-up delay-${i + 2}`}>
                <div className={styles.featureIconWrap} style={{ background: f.bg, color: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <Link href={f.link} className={styles.featureLink} style={{ color: f.color }}>
                  {f.label} <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LATEST WRITINGS ===== */}
      {articles.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionTop}>
              <div>
                <span className="section-eyebrow">Terbaru</span>
                <h2>Tulisan <span className="text-gradient">Pilihan</span></h2>
              </div>
              <Link href="/writings" className="btn btn-ghost btn-sm">
                Lihat Semua <ArrowRight size={15} />
              </Link>
            </div>

            <div className={styles.articleGrid}>
              {/* Featured first article */}
              <Link
                href={`/writings/${articles[0].slug}`}
                className={`${styles.featuredCard} card${articles[0].thumbnail ? ` ${styles.featuredCardWithImg}` : ''}`}
              >
                <div className={styles.featuredImgWrap}>
                  <div
                    className={styles.featuredImg}
                    style={
                      articles[0].thumbnail
                        ? {
                          backgroundImage: `url(${articles[0].thumbnail})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          opacity: 1,
                        }
                        : undefined
                    }
                  />
                </div>
                <div className={styles.featuredContent}>
                  {articles[0].category && (
                    <span className="badge badge-primary">{articles[0].category.name}</span>
                  )}
                  <h3 className={styles.featuredTitle}>{articles[0].title}</h3>
                  <p className={styles.featuredExcerpt}>
                    {articles[0].excerpt || articles[0].content.substring(0, 160) + '...'}
                  </p>
                  <div className={styles.articleMeta}>
                    <ArticleAuthor author={articles[0].author} anonymous={articles[0].anonymous} className={styles.metaAuthor} stopPropagation />
                    <span className={styles.metaDot}>·</span>
                    <span className={styles.metaDate}>
                      {format(new Date(articles[0].createdAt), 'dd MMM yyyy', { locale: id })}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Side articles */}
              <div className={styles.articleSide}>
                {articles.slice(1, 4).map(a => (
                  <Link key={a.id} href={`/writings/${a.slug}`} className={`${styles.miniCard} card`}>
                    <div>
                      {a.category && <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>{a.category.name}</span>}
                      <h4 className={styles.miniTitle}>{a.title}</h4>
                      <div className={styles.articleMeta} style={{ marginTop: '0.5rem' }}>
                        <ArticleAuthor author={a.author} anonymous={a.anonymous} className={styles.metaAuthor} stopPropagation />
                        <span className={styles.metaDot}>·</span>
                        <span className={styles.metaDate}>{format(new Date(a.createdAt), 'dd MMM', { locale: id })}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== FEATURED GALLERY ===== */}
      {galleryItems.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionTop}>
              <div>
                <span className="section-eyebrow">Galeri</span>
                <h2>Gambar <span className="text-gradient">Pilihan</span></h2>
              </div>
              <Link href="/gallery" className="btn btn-ghost btn-sm">
                Lihat Semua <ArrowRight size={15} />
              </Link>
            </div>

            <div className={styles.galleryGrid}>
              {galleryItems.slice(0, 6).map(item => (
                <div key={item.id} className={styles.galleryItem}>
                  <img
                    src={item.url}
                    alt={item.category || 'Gallery item'}
                    className={styles.galleryImg}
                    loading="lazy"
                  />
                  <div className={styles.galleryOverlay}>
                    {item.category && (
                      <span className="badge badge-primary">{item.category}</span>
                    )}
                    <div className={styles.galleryMeta}>
                      <span className={styles.galleryAuthor}>Oleh {item.uploadedBy.name}</span>
                      <span className={styles.galleryDate}>
                        {format(new Date(item.createdAt), 'dd MMM yyyy', { locale: id })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== LATEST FORUMS ===== */}
      {forums.length > 0 && (
        <section className={`${styles.section} ${styles.forumSection}`}>
          <div className="container">
            <div className={styles.sectionTop}>
              <div>
                <span className="section-eyebrow">Diskusi Hangat</span>
                <h2>Ruang <span className="text-gradient">Diskusi</span></h2>
              </div>
              <Link href="/forums" className="btn btn-ghost btn-sm">
                Lihat Semua <ArrowRight size={15} />
              </Link>
            </div>

            <div className={styles.forumList}>
              {forums.map((f, i) => (
                <Link key={f.id} href={`/forums/${f.id}`} className={`${styles.forumRow} card animate-fade-up delay-${i + 1}`}>
                  <div className={styles.forumNum}>{String(i + 1).padStart(2, '0')}</div>
                  <div className={styles.forumInfo}>
                    <h4 className={styles.forumTitle}>{f.title}</h4>
                    <div className={styles.articleMeta}>
                      <AuthorLink href={`/profile/${f.author.id}`} className={styles.metaAuthor} stopPropagation>
                        {f.author.name}
                      </AuthorLink>
                      <span className={styles.metaDot}>·</span>
                      <MessageSquare size={13} />
                      <span>{f._count.comments} komentar</span>
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaBox}>
            <div className={styles.ctaDecor1} />
            <div className={styles.ctaDecor2} />
            <div className={styles.ctaContent}>
              <div className={styles.ctaIcons}>
                <Users size={28} />
                <Star size={28} />
                <TrendingUp size={28} />
              </div>
              <h2>Siap untuk Memulai Perjalananmu?</h2>
              <p>Bergabunglah dengan ribuan pemuda yang berani bersuara dan berkarya nyata di platform kami.</p>
              <div className={styles.ctaBtns}>
                <Link href="/register" className="btn btn-accent btn-lg">
                  Buat Akun Gratis <ArrowRight size={18} />
                </Link>
                <Link href="/writings" className="btn btn-ghost btn-lg">
                  Jelajahi Tulisan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
