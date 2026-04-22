'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Tag, User, Eye, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import ShareButtons from '@/components/ShareButtons';
import styles from './ProgramDetail.module.css';

interface Program {
    id: string;
    title: string;
    description: string | null;
    content: string | null;
    image: string | null;
    category: string | null;
    createdBy: {
        name: string;
        id: string;
    };
    createdAt: Date;
}

interface Props {
    program: Program;
    formattedDate: string;
}

export default function ProgramDetailClient({ program, formattedDate }: Props) {
    const calculateReadingTime = (text: string | null) => {
        if (!text) return 0;
        const words = text.trim().split(/\s+/).length;
        return Math.ceil(words / 200);
    };

    const readingTime = calculateReadingTime(program.content);

    return (
        <div className={styles.page}>
            {/* Reading Header */}
            <div className="container">
                <Link href="/program" className={styles.backLink}>
                    <ArrowLeft size={16} /> Kembali ke Daftar Program
                </Link>
            </div>

            <article className={styles.article}>
                <div className="container">
                    <div className={styles.articleWrap}>
                        {/* Header */}
                        <header className={styles.articleHeader}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                {program.category && (
                                    <span className="badge badge-primary">
                                        <Tag size={11} /> {program.category}
                                    </span>
                                )}
                            </div>
                            <h1 className={styles.articleTitle}>{program.title}</h1>

                            {/* Meta */}
                            <div className={styles.meta}>
                                <div className={styles.authorInfo}>
                                    <div className={styles.authorInfoLink}>
                                        <div className={styles.authorAvatar}>
                                            {program.createdBy.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className={styles.authorName}>{program.createdBy.name}</div>
                                            <div className={styles.authorDate}>
                                                <Calendar size={12} />
                                                {formattedDate}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.metaStats}>
                                    <span className={styles.metaStat}>
                                        <Clock size={15} /> {readingTime} menit baca
                                    </span>
                                    <span className={styles.metaStat}>
                                        <ShareButtons
                                            url={`/program/${program.id}`}
                                            title={program.title}
                                            description={program.description || ''}
                                        />
                                    </span>
                                </div>
                            </div>
                        </header>

                        {/* Cover Image */}
                        {program.image && (
                            <div
                                className={styles.cover}
                                style={{
                                    backgroundImage: `url(${program.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                }}
                            />
                        )}

                        {/* Content Section */}
                        <div className={styles.content}>
                            {program.description && (
                                <p className={styles.description}>{program.description}</p>
                            )}
                            
                            <div className="space-y-6">
                                {program.content?.split('\n\n').map((section, idx) => (
                                    <div key={idx}>
                                        {section.split('\n').map((para, pIdx) => (
                                            para.trim() && (
                                                <p key={pIdx}>
                                                    {para.trim()}
                                                </p>
                                            )
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Share & Footer Section */}
                        <div className={styles.shareSection}>
                            <div className={styles.shareLabel}>Bagikan program ini</div>
                            <ShareButtons
                                url={`/program/${program.id}`}
                                title={program.title}
                                description={program.description || ''}
                            />
                        </div>

                        <div className={styles.articleFooter}>
                            <div className="flex flex-col items-center gap-4 text-center">
                                <p className="text-sm text-slate-500 italic">Terima kasih telah membaca informasi program ini.</p>
                                <Link 
                                    href="/program" 
                                    className="btn btn-primary btn-sm rounded-full"
                                >
                                    Lihat Program Lainnya
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
