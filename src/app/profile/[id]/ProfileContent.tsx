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
                setIsOwnProfile(data.isLoggedIn && data.user?.userId === userId);
            } catch (error) {
                console.error('Failed to check profile:', error);
            }
        };

        checkIfOwnProfile();
    }, [userId]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                {/** avatar if present */}
                {/** almost always show avatar image */}
                {avatar && <img src={avatar} alt="avatar" className={styles.avatar} />}
                <div className={styles.titleWrapper}>
                    <h1>{name}</h1>
                    <p className={styles.username}>@{username}</p>
                </div>
                {isOwnProfile && (
                    <Link href="/profile/edit" className={styles.editBtn}>
                        <Edit size={18} /> Edit Profile
                    </Link>
                )}
            </div>

            <p className={styles.email}>{email}</p>
            {bio && <p className={styles.bio}>{bio}</p>}
            {(instagram || twitter || linkedin) && (
                <div className={styles.socials}>
                    {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
                    {twitter && <a href={twitter} target="_blank" rel="noopener noreferrer">Twitter</a>}
                    {linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
                </div>
            )}

            <div className={styles.stats}>
                <div>
                    <strong>{articlesCount}</strong>
                    <span>Articles</span>
                </div>
                <div>
                    <strong>{forumsCount}</strong>
                    <span>Forums</span>
                </div>
                <div>
                    <strong>{commentsCount}</strong>
                    <span>Comments</span>
                </div>
            </div>

            <p className={styles.joined}>Member since {joinedDate}</p>

            {isOwnProfile && role === 'ADMIN' && (
                <div className={styles.admin}>
                    <p>👑 Administrator</p>
                </div>
            )}
            {isOwnProfile && role !== 'ADMIN' && (
                <div className={styles.user}>
                    <p>👤 Regular User</p>
                </div>
            )}
        </div>
    );
}
