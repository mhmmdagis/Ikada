import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Calendar, User, Eye, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import prisma from '@/lib/prisma';
import { getSession, isAdminRole } from '@/lib/auth';
import { unstable_noStore as noStore } from 'next/cache';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import ArticleComments from './ArticleComments';
import LikeButton from '@/components/LikeButton';
import ShareButtons from '@/components/ShareButtons';
import ArticleAuthor from '@/components/ArticleAuthor';
import OwnerActions from './OwnerActions';
import styles from './reading.module.css';

interface Props {
    params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://disada.ikada.id');

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const article = await prisma.article.findUnique({
        where: { slug },
        select: { title: true, excerpt: true, content: true, thumbnail: true, published: true },
    });
    if (!article || !article.published) return { title: 'Artikel' };

    const title = article.title;
    const description = article.excerpt || article.content.substring(0, 160).replace(/\n/g, ' ') + '...' || 'Baca artikel di Disada';
    const image = article.thumbnail ? (article.thumbnail.startsWith('http') ? article.thumbnail : `${SITE_URL}${article.thumbnail.startsWith('/') ? '' : '/'}${article.thumbnail}`) : undefined;
    const url = `${SITE_URL}/writings/${slug}`;

    return {
        title: `${title} | Disada`,
        description,
        openGraph: {
            title,
            description,
            url,
            siteName: 'Disada',
            images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined,
            locale: 'id_ID',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: image ? [image] : undefined,
        },
    };
}

const articleInclude = {
    author: {
        select: {
            id: true,
            name: true,
            avatar: true,
        }
    },
    category: true,
    _count: { select: { likes: true } },
} as const;

export default async function ArticleDetailPage({ params }: Props) {
    noStore();
    const { slug } = await params;

    const article = await prisma.article.findUnique({
        where: { slug },
        include: articleInclude,
    });

    if (!article) notFound();

    const session = await getSession();
    
    // Check access permission
    const isAuthor = session.isLoggedIn && session.userId === article.authorId;
    const isAdmin = isAuthor || isAdminRole(session.role);
    
    // Only author/admin can view unpublished articles
    if (!article.published && !isAdmin) {
        notFound();
    }
    
    // Check visibility for published articles
    if (article.published) {
        if (article.visibility === 'PRIVATE' && !isAdmin) {
            notFound();
        }
    }

    const canManage = !!(session.isLoggedIn && session.userId && (isAuthor || isAdmin));
    let initialLiked = false;
    if (session.isLoggedIn && session.userId) {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_articleId: { userId: session.userId, articleId: article.id },
            },
            select: { id: true },
        });
        initialLiked = !!existingLike;
    }

    // Increment view count
    await prisma.article.update({
        where: { id: article.id },
        data: { views: { increment: 1 } },
    });

    // Related articles
    const related = await prisma.article.findMany({
        where: {
            published: true,
            categoryId: article.categoryId,
            id: { not: article.id },
        },
        include: { author: true },
        take: 3,
    });

    return (
        <div className={styles.page}>
            {/* Reading Header */}
            <div className="container">
                <Link href="/writings" className={styles.backLink}>
                    <ArrowLeft size={16} /> Kembali ke Tulisan
                </Link>
            </div>

            <article className={styles.article}>
                <div className="container">
                    <div className={styles.articleWrap}>
                        {/* Header */}
                        <header className={styles.articleHeader}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                {article.category && (
                                    <Link href={`/writings?cat=${article.category.slug}`} className="badge badge-primary">
                                        <Tag size={11} /> {article.category.name}
                                    </Link>
                                )}
                                {!article.published && (
                                    <span className="badge badge-warning" style={{ backgroundColor: '#fbbf24', color: '#000' }}>
                                        DRAFT
                                    </span>
                                )}
                                {article.published && article.visibility === 'UNLISTED' && (
                                    <span className="badge" style={{ backgroundColor: '#9333ea', color: '#fff' }}>
                                        UNLISTED
                                    </span>
                                )}
                                {article.anonymous && (
                                    <span className="badge" style={{ backgroundColor: '#6366f1', color: '#fff' }}>
                                        ANONIM
                                    </span>
                                )}
                            </div>
                            <h1 className={styles.articleTitle}>{article.title}</h1>

                            {/* Meta */}
                            <div className={styles.meta}>
                                <div className={styles.authorInfo}>
                                    {article.anonymous ? (
                                        <div className={styles.authorInfoLink} style={{ cursor: 'default', textDecoration: 'none' }}>
                                            <div className={styles.authorAvatar}>
                                                A
                                            </div>
                                            <div>
                                                <div className={styles.authorName}>Anonim</div>
                                                <div className={styles.authorDate}>
                                                    <Calendar size={12} />
                                                    {format(new Date(article.createdAt), 'EEEE, dd MMMM yyyy', { locale: id })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <Link href={`/profile/${article.author.id}`} className={styles.authorInfoLink}>
                                            <div 
                                                className={styles.authorAvatar}
                                                style={article.author.avatar ? { 
                                                    backgroundImage: `url(${article.author.avatar})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                } : undefined}
                                            >
                                                {!article.author.avatar && article.author.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className={styles.authorName}>{article.author.name}</div>
                                                <div className={styles.authorDate}>
                                                    <Calendar size={12} />
                                                    {format(new Date(article.createdAt), 'EEEE, dd MMMM yyyy', { locale: id })}
                                                </div>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                                <div className={styles.metaStats}>
                                    <span className={styles.metaStat}>
                                        <Eye size={15} /> {article.views + 1} dilihat
                                    </span>
                                    <span className={styles.metaStat}>
                                        <LikeButton
                                            targetId={article.slug}
                                            type="article"
                                            initialCount={article._count.likes}
                                            initialLiked={initialLiked}
                                        />
                                    </span>
                                    {canManage && (
                                        <span className={styles.metaStat}>
                                            <OwnerActions slug={article.slug} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </header>

                        {/* Cover */}
                        <div
                            className={styles.cover}
                            style={
                                article.thumbnail
                                    ? {
                                          backgroundImage: `url(${article.thumbnail})`,
                                          backgroundSize: 'cover',
                                          backgroundPosition: 'center',
                                          backgroundRepeat: 'no-repeat',
                                      }
                                    : {
                                          background: article.category?.color
                                              ? `linear-gradient(135deg, ${article.category.color}25, ${article.category.color}10)`
                                              : 'var(--gradient-subtle)',
                                      }
                            }
                        />

                        {/* Content */}
                        <div className={styles.content}>
                            {article.excerpt && (
                                <p className={styles.excerpt}>{article.excerpt}</p>
                            )}
                            <div className="markdown-content">
                                <ReactMarkdown
                                    components={{
                                        img: ({ ...props }) =>
                                            props.src ? <img {...props} alt={props.alt || ''} /> : null,
                                    }}
                                >
                                    {article.content}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {/* Share & Footer */}
                        <div className={styles.shareSection}>
                            <div className={styles.shareLabel}>Bagikan artikel ini</div>
                            <ShareButtons
                                url={`/writings/${article.slug}`}
                                title={article.title}
                                description={article.excerpt || article.content.substring(0, 150) + '...'}
                            />
                        </div>
                        <div className={styles.articleFooter}>
                            <div className={styles.footerLeft}>
                                {article.category && (
                                    <Link href={`/writings?cat=${article.category.slug}`} className="badge badge-primary">
                                        {article.category.name}
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Comments */}
                        <ArticleComments slug={article.slug} allowComments={article.allowComments} />
                    </div>
                </div>
            </article>

            {/* Related */}
            {related.length > 0 && (
                <section className={styles.relatedSection}>
                    <div className="container">
                        <h2 className={styles.relatedTitle}>Tulisan <span className="text-gradient">Terkait</span></h2>
                        <div className={styles.relatedGrid}>
                            {related.map(r => (
                                <Link key={r.id} href={`/writings/${r.slug}`} className={`card ${styles.relatedCard}`}>
                                    <div className={styles.relatedCover} />
                                    <div className={styles.relatedBody}>
                                        <h4>{r.title}</h4>
                                        <span className={styles.relatedAuthor}><User size={12} /> <ArticleAuthor author={r.author} anonymous={r.anonymous} stopPropagation /></span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
