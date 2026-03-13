'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Send, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import styles from './ForumComments.module.css';

interface Author {
    id: string;
    name: string;
    username?: string;
    avatar?: string | null;
}

interface Comment {
    id: string;
    content: string;
    author: Author;
    createdAt: string;
}

interface Props {
    forumId: string;
}

export default function ForumComments({ forumId }: Props) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/forums/${forumId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [forumId]);

    useEffect(() => {
        fetch('/api/auth/me')
            .then((r) => r.json())
            .then((d) => setIsLoggedIn(!!d?.isLoggedIn))
            .catch(() => setIsLoggedIn(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setError('');
        setSubmitting(true);
        try {
            const res = await fetch(`/api/forums/${forumId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: content.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Gagal mengirim komentar');
                return;
            }

            setContent('');
            setComments((prev) => [...prev, data]);
        } catch (err) {
            setError('Terjadi kesalahan. Coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className={styles.section}>
            <h3 className={styles.title}>
                <MessageSquare size={20} />
                Komentar ({comments.length})
            </h3>

            {isLoggedIn === false && (
                <p className={styles.loginHint}>
                    <Link href="/login">Login</Link> untuk berkomentar.
                </p>
            )}

            {isLoggedIn && (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Tulis komentar..."
                        rows={3}
                        className={styles.textarea}
                        disabled={submitting}
                    />
                    {error && <p className={styles.error}>{error}</p>}
                    <button
                        type="submit"
                        disabled={submitting || !content.trim()}
                        className={styles.submitBtn}
                    >
                        {submitting ? (
                            <Loader size={18} className={styles.spinner} />
                        ) : (
                            <Send size={18} />
                        )}
                        {submitting ? 'Mengirim...' : 'Kirim'}
                    </button>
                </form>
            )}

            <div className={styles.list}>
                {loading ? (
                    <p className={styles.loading}>Memuat komentar...</p>
                ) : comments.length === 0 ? (
                    <p className={styles.empty}>Belum ada komentar. Jadilah yang pertama!</p>
                ) : (
                    comments.map((c) => (
                        <div key={c.id} className={styles.comment}>
                            <div className={styles.commentAvatar}>
                                {c.author.avatar ? (
                                    <img src={c.author.avatar} alt="" />
                                ) : (
                                    <span>{c.author.name.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className={styles.commentBody}>
                                <div className={styles.commentHeader}>
                                    <Link href={`/profile/${c.author.id}`} className={styles.commentAuthor}>
                                        {c.author.name}
                                    </Link>
                                    <span className={styles.commentDate}>
                                        {format(new Date(c.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                                    </span>
                                </div>
                                <p className={styles.commentContent}>{c.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}