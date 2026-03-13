'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Loader } from 'lucide-react';
import styles from '../manage.module.css';

interface User {
    id: string;
    name: string;
    email: string;
}

interface Forum {
    id: string;
    title: string;
}

interface Article {
    id: string;
    title: string;
    slug?: string;
}

interface Comment {
    id: string;
    content: string;
    author: User;
    forum?: Forum | null;
    article?: Article | null;
    createdAt: string;
}

export default function CommentsPage() {
    const router = useRouter();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch('/api/admin/comments');
                if (!res.ok) {
                    router.push('/login');
                    return;
                }
                setComments(await res.json());
            } catch (error) {
                console.error('Failed to fetch comments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [router]);

    const handleDelete = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        setDeleting(commentId);
        try {
            const res = await fetch('/api/admin/comments', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId }),
            });

            if (res.ok) {
                setComments(comments.filter(c => c.id !== commentId));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete comment');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin" className={styles.backBtn}>
                    <ArrowLeft size={20} /> Back
                </Link>
                <h1>Manage Comments</h1>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                <div className={styles.commentsList}>
                    {comments.length === 0 ? (
                        <p className={styles.empty}>No comments yet</p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className={styles.commentCard}>
                                <div className={styles.commentHeader}>
                                    <div className={styles.userInfo}>
                                        <strong>{comment.author?.name ?? 'Unknown'}</strong>
                                        <small>{comment.author?.email ?? ''}</small>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        disabled={deleting === comment.id}
                                        className={styles.deleteBtn}
                                    >
                                        {deleting === comment.id ? (
                                            <Loader size={18} className={styles.spinning} />
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                    </button>
                                </div>
                                <div className={styles.commentContent}>
                                    <p>{comment.content}</p>
                                </div>
                                <div className={styles.commentFooter}>
                                    <small className={styles.date}>
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </small>
                                    {comment.forum && (
                                        <small className={styles.parent}>
                                            Forum: {comment.forum.title}
                                        </small>
                                    )}
                                    {comment.article && (
                                        <small className={styles.parent}>
                                            <a href={`/writings/${comment.article.slug}`} target="_blank" rel="noopener noreferrer">
                                                Artikel: {comment.article.title}
                                            </a>
                                        </small>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <p className={styles.info}>Total Comments: {comments.length}</p>
        </div>
    );
}
