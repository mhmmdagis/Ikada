'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Eye, EyeOff, Loader } from 'lucide-react';
import styles from '../manage.module.css';

interface Author {
    id: string;
    name: string;
    email: string;
}

interface Article {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    views: number;
    author: Author;
    createdAt: string;
}

export default function ArticlesPage() {
    const router = useRouter();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await fetch('/api/admin/articles');
                if (!res.ok) {
                    router.push('/login');
                    return;
                }
                setArticles(await res.json());
            } catch (error) {
                console.error('Failed to fetch articles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [router]);

    const handleDelete = async (articleId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus artikel ini?')) return;

        setDeleting(articleId);
        try {
            const res = await fetch('/api/admin/articles', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId }),
            });

            if (res.ok) {
                setArticles(articles.filter(a => a.id !== articleId));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete article');
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            alert('Failed to delete article');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin" className={styles.backBtn}>
                    <ArrowLeft size={20} /> Kembali
                </Link>
                <h1>Kelola Artikel</h1>
            </div>

            {loading ? (
                <div className={styles.loading}>Memuat...</div>
            ) : (
                <div className={styles.table}>
                    <div className={styles.tableHeader}>
                        <div className={styles.colTitle}>Judul</div>
                        <div className={styles.colAuthor}>Penulis</div>
                        <div className={styles.colStatus}>Status</div>
                        <div className={styles.colViews}>Dilihat</div>
                        <div className={styles.colAction}>Aksi</div>
                    </div>

                    <div className={styles.tableBody}>
                        {articles.map(article => (
                            <div key={article.id} className={styles.tableRow}>
                                <div className={styles.colTitle}>
                                    <strong>{article.title}</strong>
                                    <small>{article.slug}</small>
                                </div>
                                <div className={styles.colAuthor}>
                                    <div>{article.author.name}</div>
                                    <small>{article.author.email}</small>
                                </div>
                                <div className={styles.colStatus}>
                                    <span className={`${styles.badge} ${article.published ? styles.published : styles.draft}`}>
                                        {article.published ? (
                                            <>
                                                <Eye size={14} /> Terbit
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff size={14} /> Draft
                                            </>
                                        )}
                                    </span>
                                </div>
                                <div className={styles.colViews}>{article.views}</div>
                                <div className={styles.colAction}>
                                    <button
                                        onClick={() => handleDelete(article.id)}
                                        disabled={deleting === article.id}
                                        className={styles.deleteBtn}
                                    >
                                        {deleting === article.id ? (
                                            <Loader size={18} className={styles.spinning} />
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <p className={styles.info}>Total Artikel: {articles.length}</p>
        </div>
    );
}
