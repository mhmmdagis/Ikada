'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import styles from './profile.module.css';

interface ProfileContentProps {
    userId: string;
    username: string;
    avatar?: string;
    name: string;
    email: string;
    bio?: string;
    major?: string;
    batch?: string;
    role: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    articlesCount: number;
    forumsCount: number;
    commentsCount: number;
    joinedDate: string;
}

export default function ProfileContent({
    userId,
    username,
    avatar,
    name,
    email,
    bio,
    major,
    batch,
    role,
    instagram,
    twitter,
    linkedin,
    articlesCount,
    forumsCount,
    commentsCount,
    joinedDate,
}: ProfileContentProps) {
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    useEffect(() => {
        const checkIfOwnProfile = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                setIsOwnProfile(data.isLoggedIn && data.user?.id === userId);
            } catch (error) {
                console.error('Failed to check profile:', error);
            }
        };

        checkIfOwnProfile();
    }, [userId]);

    return (
        <div className={styles.container}>
            <div className={styles.cover}></div>
            <div className={styles.profileInfo}>
                <div className={styles.header}>
                    {/** avatar if present */}
                    {/** almost always show avatar image */}
                    {avatar ? (
                        <img src={avatar} alt="avatar" className={styles.avatar} />
                    ) : (
                        <div className={styles.avatar}></div>
                    )}
                    <div className={styles.titleWrapper}>
                        <h1>{name}</h1>
                        <p className={styles.username}>@{username}</p>
                    </div>
                    {isOwnProfile && (
                        <Link href="/profile/edit" className={styles.editBtn}>
                            <Edit size={16} /> Edit Profile
                        </Link>
                    )}
                </div>

            <p className={styles.email}>{email}</p>
            {major && <p className={styles.bio}><strong>Jurusan:</strong> {major}</p>}
            {batch && <p className={styles.bio}><strong>Angkatan:</strong> {batch}</p>}
            {bio && <p className={styles.bio}>{bio}</p>}
            {(instagram || twitter || linkedin) && (
                <div className={styles.socials}>
                    {instagram && (
                        <a href={instagram} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="Instagram" aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                            </svg>
                            <span>Instagram</span>
                        </a>
                    )}
                    {twitter && (
                        <a href={twitter} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="Twitter / X" aria-label="Twitter">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            <span>Twitter / X</span>
                        </a>
                    )}
                    {linkedin && (
                        <a href={linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="LinkedIn" aria-label="LinkedIn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            <span>LinkedIn</span>
                        </a>
                    )}
                </div>
            )}

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <strong>{articlesCount}</strong>
                    <span>Articles</span>
                </div>
                <div className={styles.statCard}>
                    <strong>{forumsCount}</strong>
                    <span>Forums</span>
                </div>
                <div className={styles.statCard}>
                    <strong>{commentsCount}</strong>
                    <span>Comments</span>
                </div>
            </div>

            <p className={styles.joined}>Member since {joinedDate}</p>

            {isOwnProfile && (role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                <div className={styles.admin}>
                    <p>👑 Administrator</p>
                </div>
            )}
            {isOwnProfile && role === 'USER' && (
                <div className={styles.user}>
                    <p>👤 Regular User</p>
                </div>
            )}
            </div>
        </div>
    );
}
