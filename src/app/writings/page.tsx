import Link from 'next/link';
import ArticleAuthor from '@/components/ArticleAuthor';
import { Search, BookOpen, Plus, ArrowRight, Hash, Filter } from 'lucide-react';
import CategoryDropdown from '@/components/CategoryDropdown';
import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import styles from './writings.module.css';

// Revalidate every 1 minute
export const revalidate = 60;

export default async function WritingsPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
    const { cat } = await searchParams;

    const [articles, categories] = await Promise.all([
        prisma.article.findMany({
            where: {
                published: true,
                ...(cat ? { category: { slug: cat } } : {}),
            },
            include: { author: true, category: true, _count: { select: { likes: true } } },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.category.findMany({ orderBy: { name: 'asc' } }),
    ]);

    return (
        <div className={styles.page}>
            {/* Header */}
            <section className={styles.header}>
                <div className={styles.headerBlob} />
                <div className="container">
                    <div className={styles.headerContent}>
                        <div className={styles.headerText}>
                            <span className="section-eyebrow animate-fade-up"><BookOpen size={13} /> Ruang Kata</span>
                            <h1 className="animate-fade-up delay-1">
                                Kumpulan <span className="text-gradient">Tulisan</span>
                            </h1>
                            <p className="animate-fade-up delay-2">
                                Artikel, opini, dan esai kritis dari para penulis muda Indonesia.
                            </p>
                        </div>
                        <Link href="/writings/new" className="btn btn-primary animate-fade-up delay-3">
                            <Plus size={18} /> Tulis Artikel
                        </Link>
                    </div>

                    {/* Category Filter Dropdown */}
                    <CategoryDropdown categories={categories} activeCat={cat} />
                </div>
            </section>

            {/* Article Grid */}
            <section className={styles.content}>
                <div className="container">
                    {articles.length > 0 ? (
                        <div className={styles.grid}>
                            {articles.map((a, i) => (
                                <Link
                                    key={a.id}
                                    href={`/writings/${a.slug}`}
                                    className={`card ${styles.card} animate-fade-up delay-${Math.min(i + 1, 5)}`}
                                >
                                    {/* Cover area */}
                                    <div
                                        className={styles.cardCover}
                                        style={
                                            a.thumbnail
                                                ? {
                                                      backgroundImage: `url(${a.thumbnail})`,
                                                      backgroundSize: 'cover',
                                                      backgroundPosition: 'center',
                                                      backgroundRepeat: 'no-repeat',
                                                  }
                                                : {
                                                      background: a.category?.color
                                                          ? `linear-gradient(135deg, ${a.category.color}30, ${a.category.color}15)`
                                                          : 'var(--gradient-subtle)',
                                                  }
                                        }
                                    >
                                        {!a.thumbnail && (
                                            <BookOpen
                                                size={32}
                                                style={{
                                                    opacity: 0.3,
                                                    color: a.category?.color || 'var(--brand-primary)',
                                                }}
                                            />
                                        )}
                                    </div>

                                    <div className={styles.cardBody}>
                                        {a.category && (
                                            <span className="badge badge-primary">{a.category.name}</span>
                                        )}
                                        <h3 className={styles.cardTitle}>{a.title}</h3>
                                        <p className={styles.cardExcerpt}>
                                            {a.excerpt || a.content.substring(0, 120) + '...'}
                                        </p>
                                        <div className={styles.cardFooter}>
                                            <div className={styles.cardMeta}>
                                                <ArticleAuthor author={a.author} anonymous={a.anonymous} className={styles.metaAuthor} stopPropagation />
                                                <span>·</span>
                                                <span className={styles.metaDate}>
                                                    {format(new Date(a.createdAt), 'dd MMM yyyy', { locale: id })}
                                                </span>
                                            </div>
                                            <span className={styles.readMore}>
                                                Baca <ArrowRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <BookOpen size={52} />
                            <h3>Belum ada tulisan</h3>
                            <p>Jadilah yang pertama berbagi tulisan di kategori ini!</p>
                            <Link href="/writings/new" className="btn btn-primary">
                                <Plus size={16} /> Tulis Sekarang
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
