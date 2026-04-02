'use client';

import { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Link2, Check } from 'lucide-react';

interface ShareButtonsProps {
    url: string;
    title: string;
    description?: string;
    className?: string;
}

const getBaseUrl = () => {
    // Prioritas 1: NEXT_PUBLIC_SITE_URL (production URL)
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL;
    }
    // Prioritas 2: Vercel production URL (jika VERCEL_PROJECT_PRODUCTION_URL ada)
    if (typeof window !== 'undefined' && window.location.hostname === 'vercel.com') {
        return 'https://disada-ikada.vercel.app';
    }
    // Fallback
    return 'http://localhost:3000';
};

export default function ShareButtons({ url, title, description = '', className = '' }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);
    const baseUrl = getBaseUrl();
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDesc = encodeURIComponent(description);

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    return (
        <div className={className} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'var(--gradient-main, linear-gradient(135deg, #2ec4b6, #8b5cf6))',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md, 0.5rem)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(46, 196, 182, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                }}
                aria-expanded={open}
                aria-haspopup="true"
            >
                <Share2 size={18} />
                Bagikan
            </button>

            {open && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 40,
                        }}
                        onClick={() => setOpen(false)}
                        aria-hidden="true"
                    />
                    <div
                        role="menu"
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            marginTop: '0.5rem',
                            background: 'var(--bg-primary, white)',
                            border: '1px solid var(--border-light, #e2e8f0)',
                            borderRadius: 'var(--radius-lg, 0.75rem)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                            padding: '0.75rem',
                            zIndex: 50,
                            minWidth: '200px',
                        }}
                    >
                        <p style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-tertiary, #64748b)',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                        }}>
                            Bagikan ke
                        </p>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                        }}>
                            <a
                                href={shareLinks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: '#1877f2',
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                <Facebook size={18} />
                                Facebook
                            </a>
                            <a
                                href={shareLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: '#000',
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                }}
                            >
                                <Twitter size={18} />
                                X
                            </a>
                            <a
                                href={shareLinks.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: '#25d366',
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                }}
                            >
                                <MessageCircle size={18} />
                                WhatsApp
                            </a>
                            <a
                                href={shareLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: '#0a66c2',
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                }}
                            >
                                <Linkedin size={18} />
                                LinkedIn
                            </a>
                            <button
                                type="button"
                                onClick={() => { handleCopy(); setOpen(false); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-secondary, #f1f5f9)',
                                    color: 'var(--text-primary, #1e293b)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                }}
                            >
                                {copied ? <Check size={18} color="#10b981" /> : <Link2 size={18} />}
                                {copied ? 'Tersalin!' : 'Salin Link'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
