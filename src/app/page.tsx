import Link from 'next/link';
import ArticleAuthor from '@/components/ArticleAuthor';
import AuthorLink from '@/components/AuthorLink';
import { ArrowRight, BookOpen, MessageSquare, Calendar, Star, Image as ImageIcon, Users, TrendingUp, Flame, Zap } from 'lucide-react';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import styles from './page.module.css';
import ScrollReveal from '@/components/ScrollReveal';
import CountUp from '@/components/CountUp';

export const revalidate = 300; // revalidate every 5 minutes

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
      <section className={`${styles.hero} mesh-container pattern-grid`}>
        <div className="mesh-gradient">
          <div className="mesh-blob mesh-blob-1" />
          <div className="mesh-blob mesh-blob-2" />
        </div>

        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <ScrollReveal animation="fade-in" duration={400}>
                <span className="badge badge-primary" style={{ marginBottom: '1.5rem', fontWeight: 800 }}>
                  <Zap size={14} style={{ marginRight: '4px' }} /> PLATFORM GENERASI MUDA
                </span>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={100}>
                <h1 className={styles.heroTitle}>
                  Menyatukan Asa, <br />
                  <span className="text-gradient">Bangkit Bersama</span>
                </h1>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={200}>
                <p className={styles.heroSub}>
                  Platform resmi Disada (Berbagi Opini Bareng IKADA) Jabodetabek-Banten.
                  Wadah kolaborasi, inovasi, dan silaturahmi alumni untuk masa depan gemilang.
                </p>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={300}>
                <div className={styles.heroCta}>
                  <Link href="/register" className="btn btn-primary btn-lg">
                    Gabung Sekarang <ArrowRight size={18} />
                  </Link>
                  <Link href="/about" className="btn btn-ghost btn-lg">
                    Eksplorasi
                  </Link>
                </div>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={400}>
                <div className={styles.statsRow} style={{ marginTop: '3rem' }}>
                  <div className={styles.stat}>
                    <div className={styles.statNum}><CountUp end={totalArticles} suffix="+" /></div>
                    <div className={styles.statLabel}>KARYA TULIS</div>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.stat}>
                    <div className={styles.statNum}><CountUp end={totalForums} suffix="+" /></div>
                    <div className={styles.statLabel}>OPINI AKTIF</div>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.stat}>
                    <div className={styles.statNum}><CountUp end={totalUsers} suffix="+" /></div>
                    <div className={styles.statLabel}>ALUMNI</div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal animation="scale-in" delay={300} className={styles.heroImageWrap}>
              <div className={styles.heroImageGlow} />
              <Image
                src="/ikada-logo.png"
                alt="Logo IKADA"
                width={450}
                height={450}
                className={styles.heroImage}
                draggable={false}
                priority
              />
            </ScrollReveal>
          </div>
        </div>
      </section>


      {/* ===== INTRO ===== */}
      <section className={styles.intro}>
        <div className="container">
          <div className={styles.introGrid}>
            <ScrollReveal animation="fade-up" className={styles.introContent}>

              <h2 className={styles.introTitle}>Mengenal Pondasi <span className="text-gradient">IKADA</span></h2>
              <div className={styles.introBody}>
                <p className={styles.introText}>
                  Ikatan Keluarga Alumni Darussalam (IKADA) Jabodetabek-Banten adalah rumah bagi seluruh alumni Pondok Pesantren Darussalam Ciamis yang berdomisili di wilayah Jabodetabek dan Banten.
                </p>
                <p className={styles.introText}>
                  Kami berkomitmen untuk menjadi wadah yang mempererat tali persaudaraan, membangun potensi ekonomi alumni, dan memberikan kontribusi nyata bagi almamater.
                </p>
              </div>
              <Link href="/about" className="btn btn-secondary btn-sm mt-8">Selengkapnya</Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== VISION ===== */}
      <section className={styles.vision}>
        <div className="container" style={{ paddingBottom: '3rem' }}>
          <ScrollReveal animation="scale-in" className={styles.visionInner}>

            <h2 className={styles.visionTitle}>Bergerak <span className="text-gradient">Bersama</span> Untuk Kesejahteraan</h2>
            <p className={styles.visionText}>
              "Menjadi organisasi alumni yang kuat and solid, bergerak bersama untuk mewujudkan masyarakat yang sejahtera, terbuka, dan berkeadilan, sambil terus mempererat silaturahmi."
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className={`${styles.features} pattern-grid`}>
        <div className="container" style={{ paddingBottom: '4rem' }}>
          <ScrollReveal animation="fade-up" className="section-header">

            <h2>Pilar Utama <span className="text-gradient">Layanan</span> Disada</h2>
            <p>Berbagai fitur yang dirancang khusus untuk mendukung pertumbuhan kompetensi alumni.</p>
          </ScrollReveal>

          <div className={styles.featureGrid}>
            {[
              {
                icon: <BookOpen size={28} />,
                color: 'var(--brand-primary)',
                bg: 'rgba(46, 196, 182,.1)',
                title: 'Ruang Literasi',
                desc: 'Terbitkan artikel dan opini kamu di sini. Wadah untuk berbagi pemikiran kritis dan karya tulis berkualitas.',
                link: '/writings',
                label: 'Baca Tulisan',
              },
              {
                icon: <MessageSquare size={28} />,
                color: 'var(--brand-secondary)',
                bg: 'rgba(27, 154, 170,.1)',
                title: 'Ruang Berbagi Opini',
                desc: 'Bertukar ide dan solusi dalam ruang interaktif. Suara setiap alumni berharga untuk kemajuan bersama.',
                link: '/forums',
                label: 'Berbagi Opini Sekarang',
              },
              {
                icon: <Calendar size={28} />,
                color: 'var(--brand-accent)',
                bg: 'rgba(255, 214, 10,.08)',
                title: 'Event Alumni',
                desc: 'Dapatkan akses ke webinar, workshop, dan agenda silaturahmi akbar yang diselenggarakan IKADA.',
                link: '/events',
                label: 'Cek Agenda',
              },
              {
                icon: <Star size={28} />,
                color: '#10b981',
                bg: 'rgba(16, 185, 129,.1)',
                title: 'Program Kerja',
                desc: 'Pantau perkembangan program sosial, ekonomi, dan pemberdayaan yang sedang kami jalankan.',
                link: '/program',
                label: 'Info Program',
              },
            ].map((f, i) => (
              <ScrollReveal key={i} animation="fade-up" delay={i * 100} className={`card ${styles.featureCard}`}>
                <div className={styles.featureIconWrap} style={{ background: f.bg, color: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <Link href={f.link} className={styles.featureLink} style={{ color: f.color }}>
                  {f.label} <ArrowRight size={15} />
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LATEST WRITINGS ===== */}
      {articles.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <ScrollReveal animation="fade-up" className={styles.sectionTop}>
              <div className={styles.sectionTitleWrap}>

                <h2>Informasi & <span className="text-gradient">Inspirasi</span></h2>
              </div>
              <Link href="/writings" className={`btn btn-ghost btn-sm ${styles.sectionAction}`}>
                Lihat Semua <ArrowRight size={15} />
              </Link>
            </ScrollReveal>

            <div className={styles.articleGrid}>
              <ScrollReveal animation="fade-up" delay={200} className="h-full">
                <Link
                  href={`/writings/${articles[0].slug}`}
                  className={`${styles.featuredCard} card h-full${articles[0].thumbnail ? ` ${styles.featuredCardWithImg}` : ''}`}
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
              </ScrollReveal>

              <div className={styles.articleSide}>
                {articles.slice(1, 4).map((a, i) => (
                  <ScrollReveal key={a.id} animation="fade-up" delay={i * 100}>
                    <Link href={`/writings/${a.slug}`} className={`${styles.miniCard} card`}>
                      <div>
                        {a.category && <span className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>{a.category.name}</span>}
                        <h4 className={styles.miniTitle}>{a.title}</h4>
                        <div className={styles.articleMeta} style={{ marginTop: '0.4rem' }}>
                          <ArticleAuthor author={a.author} anonymous={a.anonymous} className={styles.metaAuthor} stopPropagation />
                          <span className={styles.metaDot}>·</span>
                          <span className={styles.metaDate}>{format(new Date(a.createdAt), 'dd MMM', { locale: id })}</span>
                        </div>
                      </div>
                      <ArrowRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Simple horizontal divider */}
      <div className="container">
        <hr className="divider" style={{ margin: 0, opacity: 0.5 }} />
      </div>

      {/* ===== LATEST FORUMS ===== */}
      {forums.length > 0 && (
        <section className={`${styles.section} ${styles.forumSection} pattern-dots`}>
          <div className="container">
            <ScrollReveal animation="fade-in" className={styles.sectionTop}>
              <div>

                <h2>Opinimu <span className="text-gradient">Sangat Berarti</span></h2>
              </div>
              <Link href="/forums" className="btn btn-ghost btn-sm">
                Buka Forum <ArrowRight size={15} />
              </Link>
            </ScrollReveal>

            <div className={styles.forumList}>
              {forums.map((f, i) => (
                <ScrollReveal key={f.id} animation="fade-up" delay={i * 50}>
                  <Link href={`/forums/${f.id}`} className={`${styles.forumRow} card`}>
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
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className={styles.cta}>
        <div className="container">
          <ScrollReveal animation="scale-in">
            <div className={styles.ctaBox}>
              <div className={styles.ctaDecor1} />
              <div className={styles.ctaDecor2} />
              <div className={styles.ctaContent}>
                <div className={styles.ctaIcons}>
                  <Users size={32} />
                  <TrendingUp size={32} />
                  <Star size={32} />
                </div>
                <h2 className="text-4xl font-bold">Siap Menjadi Bagian Dari Perubahan?</h2>
                <p className="text-lg opacity-90">Bergabunglah dengan ekosistem alumni terbesar di Jabodetabek-Banten sekarang juga.</p>
                <div className={styles.ctaBtns}>
                  <Link href="/register" className="btn btn-accent btn-lg">
                    Daftar Sekarang <ArrowRight size={18} />
                  </Link>
                  <Link href="/writings" className="btn btn-ghost btn-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
                    Lihat Karya
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
