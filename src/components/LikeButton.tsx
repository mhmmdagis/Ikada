'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
    targetId: string;
    type: 'article' | 'forum' | 'comment';
    initialCount: number;
    initialLiked?: boolean;
    className?: string;
}

export default function LikeButton({ targetId, type, initialCount, initialLiked = false, className = '' }: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    const apiPath =
        type === 'article'
            ? `/api/articles/${targetId}/like`
            : type === 'forum'
                ? `/api/forums/${targetId}/like`
                : `/api/comments/${targetId}/like`;

    const handleClick = async () => {
        if (loading) return;

        setLoading(true);
        try {
            const res = await fetch(apiPath, { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    alert('Silakan login untuk menyukai.');
                    return;
                }
                throw new Error(data.error || 'Gagal menyukai');
            }

            setLiked(data.liked);
            setCount(data.count);
        } catch (err) {
            console.error('Like error:', err);
            alert(err instanceof Error ? err.message : 'Gagal menyukai.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className={className}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                background: 'none',
                border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                padding: 0,
                fontSize: 'inherit',
                color: liked ? 'var(--brand-primary, #2ec4b6)' : 'var(--text-tertiary, #94a3b8)',
                transition: 'color 0.2s, transform 0.2s',
                opacity: loading ? 0.7 : 1,
            }}
            title={liked ? 'Batalkan suka' : 'Suka'}
            aria-pressed={liked}
        >
            <Heart
                size={15}
                fill={liked ? 'currentColor' : 'none'}
                strokeWidth={2}
                style={{ flexShrink: 0 }}
            />
            <span>{count} suka</span>
        </button>
    );
}
