'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Send, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import LikeButton from '@/components/LikeButton';
import styles from './ArticleComments.module.css';

interface Author {
    id: string;
    name: string;
    username: string;
    avatar?: string | null;
}

interface Comment {
    id: string;
    content: string;
    author: Author;
    createdAt: string;
    parentId?: string | null;
    _count?: { likes: number };
    likedByMe?: boolean;
}

interface Props {
    slug: string;
    allowComments: boolean;
}

export default function ArticleComments({ slug, allowComments }: Props) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [replyToId, setReplyToId] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/articles/${slug}/comments`);
                if (res.ok) {
                    const data = await res.json();
                    if (!cancelled) setComments(Array.isArray(data) ? data : []);
                }
            } catch (e) {
                console.error('Failed to fetch comments:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [slug]);

    useEffect(() => {
        fetch('/api/auth/me')
            .then((r) => r.json())
            .then((d) => setIsLoggedIn(!!d?.isLoggedIn))
            .catch(() => setIsLoggedIn(false));
    }, []);

    const submitComment = async (nextContent: string, parentId?: string | null) => {
        if (!nextContent.trim()) return;

        setError('');
        setSubmitting(true);
        try {
            const res = await fetch(`/api/articles/${slug}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: nextContent.trim(), parentId: parentId || null }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Gagal mengirim komentar');
                return;
            }

            setComments((prev) => [...prev, data]);
            if (parentId) {
                setReplyContent('');
                setReplyToId(null);
            } else {
                setContent('');
            }
        } catch {
            setError('Terjadi kesalahan. Coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitComment(content, null);
    };

    const grouped = comments.reduce((acc, c) => {
        const key = c.parentId || 'root';
        (acc[key] ||= []).push(c);
        return acc;
    }, {} as Record<string, Comment[]>);

    const renderThread = (list: Comment[], depth = 0) => {
        return list.map((c) => {
            const children = grouped[c.id] || [];
            const likeCount = c._count?.likes ?? 0;
            const likedByMe = !!c.likedByMe;
            return (
                <div key={c.id} className={styles.threadItem} style={{ marginLeft: depth ? depth * 22 : 0 }}>
                    <div id={`comment-${c.id}`} className={styles.comment}>
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

                            <div className={styles.commentActions}>
                                <LikeButton
                                    targetId={c.id}
                                    type="comment"
                                    initialCount={likeCount}
                                    initialLiked={likedByMe}
                                    className={styles.likeBtn}
                                />
                                {allowComments && (
                                    <button
                                        type="button"
                                        className={styles.replyBtn}
                                        onClick={() => setReplyToId((prev) => (prev === c.id ? null : c.id))}
                                        disabled={submitting || isLoggedIn === false}
                                    >
                                        Balas
                                    </button>
                                )}
                            </div>

                            {allowComments && isLoggedIn && replyToId === c.id && (
                                <form
                                    className={styles.replyForm}
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        submitComment(replyContent, c.id);
                                    }}
                                >
                                    <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Tulis balasan..."
                                        rows={2}
                                        className={styles.replyTextarea}
                                        disabled={submitting}
                                    />
                                    <div className={styles.replyActions}>
                                        <button
                                            type="submit"
                                            disabled={submitting || !replyContent.trim()}
                                            className={styles.replySubmit}
                                        >
                                            {submitting ? 'Mengirim...' : 'Kirim Balasan'}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.replyCancel}
                                            onClick={() => {
                                                setReplyToId(null);
                                                setReplyContent('');
                                            }}
                                            disabled={submitting}
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {children.length > 0 && (
                        <div className={styles.replies}>
                            {renderThread(children, depth + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <section className={styles.section}>
            <h3 className={styles.title}>
                <MessageSquare size={20} />
                Komentar ({comments.length})
            </h3>

            {allowComments && isLoggedIn === false && (
                <p className={styles.loginHint}>
                    <Link href="/login">Login</Link> untuk berkomentar.
                </p>
            )}

            {allowComments && isLoggedIn && (
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

            {!allowComments && (
                <p className={styles.disabledHint}>Komentar dinonaktifkan untuk artikel ini.</p>
            )}

            <div className={styles.list}>
                {loading ? (
                    <p className={styles.loading}>Memuat komentar...</p>
                ) : comments.length === 0 ? (
                    <p className={styles.empty}>Belum ada komentar. Jadilah yang pertama!</p>
                ) : (
                    renderThread(grouped.root || [])
                )}
            </div>
        </section>
    );
}
