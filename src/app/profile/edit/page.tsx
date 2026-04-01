'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader } from 'lucide-react';
import styles from './edit.module.css';

export default function EditProfilePage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        username: '',
        email: '',
        bio: '',
        major: '',
        batch: '',
        avatar: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [galleryError, setGalleryError] = useState('');
    const [gallery, setGallery] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (!res.ok) {
                    router.push('/login');
                    return;
                }
                const data = await res.json();
                if (data.isLoggedIn && data.user) {
                    // only update the fields returned by the API, leave passwords untouched
                    setForm(prev => ({
                        ...prev,
                        name: data.user.name || '',
                        username: data.user.username || '',
                        email: data.user.email || '',
                        bio: data.user.bio || '',
                        major: data.user.major || '',
                        batch: data.user.batch || '',
                        avatar: data.user.avatar || '',
                        instagram: data.user.instagram || '',
                        twitter: data.user.twitter || '',
                        linkedin: data.user.linkedin || '',
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to upload avatar');
                return;
            }

            if (data.url) {
                setForm(prev => ({ ...prev, avatar: data.url }));
                setSuccess('Avatar uploaded successfully');
            }
        } catch (err) {
            console.error('Error uploading avatar:', err);
            setError('An error occurred while uploading avatar');
        } finally {
            setUploading(false);
            // reset file input
            e.target.value = '';
        }
    };

    const toggleGallery = async () => {
        const willOpen = !galleryOpen;
        setGalleryOpen(willOpen);
        if (!willOpen || gallery.length > 0) return;

        setGalleryLoading(true);
        setGalleryError('');
        try {
            const res = await fetch('/api/uploads');
            const data = await res.json();
            if (!res.ok) {
                setGalleryError(data.error || 'Failed to load gallery');
                return;
            }
            if (Array.isArray(data)) {
                setGallery(data);
            } else {
                setGallery([]);
            }
        } catch (err) {
            console.error('Error loading gallery:', err);
            setGalleryError('Failed to load gallery');
        } finally {
            setGalleryLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            // password validation
            if (form.password && form.password.length < 8) {
                setError('Password minimal 8 karakter');
                setSaving(false);
                return;
            }
            if (form.password && form.password !== form.confirmPassword) {
                setError('Passwords do not match');
                setSaving(false);
                return;
            }
            // strip confirmPassword before sending
            const { confirmPassword, ...payload } = form;
            const res = await fetch('/api/auth/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to update profile');
                return;
            }

            setSuccess('Profile updated successfully!');
            window.dispatchEvent(new CustomEvent('profile-updated'));
            setTimeout(() => {
                router.push(`/profile/${data.user.id}`);
                router.refresh();
            }, 1500);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('An error occurred while updating profile');
        } finally {
            setSaving(false);
        }
    };

    const passwordStrength = (() => {
        const value = form.password;
        if (!value) return null;

        let score = 0;
        if (value.length >= 8) score++;
        if (/[A-Z]/.test(value)) score++;
        if (/[0-9]/.test(value)) score++;
        if (/[^A-Za-z0-9]/.test(value)) score++;

        if (score <= 1) return { level: 'weak' as const, label: 'Kekuatan password: lemah' };
        if (score === 2 || score === 3) return { level: 'medium' as const, label: 'Kekuatan password: cukup' };
        return { level: 'strong' as const, label: 'Kekuatan password: kuat' };
    })();

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href={`/profile`} className={styles.backBtn}>
                    <ArrowLeft size={20} /> Back
                </Link>
                <h1>Edit Profile</h1>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <div className={styles.sectionTitle}>Informasi dasar</div>

                <div className={styles.formGroup}>
                    <label htmlFor="username">Username *</label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="unique username"
                        required
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="name">Full Name *</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address *</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="bio">Bio</label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        placeholder="Tuliskan sedikit tentang dirimu..."
                        className={styles.input}
                        rows={3}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="major">Jurusan</label>
                    <input
                        id="major"
                        type="text"
                        name="major"
                        value={form.major}
                        onChange={handleChange}
                        placeholder="Contoh: Sistem Informasi"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="batch">Angkatan</label>
                    <input
                        id="batch"
                        type="text"
                        name="batch"
                        value={form.batch}
                        onChange={handleChange}
                        placeholder="Contoh: 2023"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="avatar">Avatar</label>
                    <div className={styles.avatarRow}>
                        <div className={styles.avatarPreview}>
                            {form.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={form.avatar} alt="Avatar preview" />
                            ) : (
                                <span className={styles.avatarPlaceholder}>A</span>
                            )}
                        </div>
                        <div className={styles.avatarControls}>
                            <input
                                id="avatar"
                                type="text"
                                name="avatar"
                                value={form.avatar}
                                onChange={handleChange}
                                placeholder="Tempelkan URL gambar (https://...)"
                                className={styles.input}
                            />
                            <small className={styles.hint}>
                                Kamu bisa menggunakan URL gambar atau upload/pilih dari galeri.
                            </small>
                            <div className={styles.avatarButtons}>
                                <label className={styles.avatarUploadBtn}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                    />
                                    {uploading ? 'Mengupload...' : 'Upload dari perangkat'}
                                </label>
                                <button
                                    type="button"
                                    className={styles.avatarGalleryBtn}
                                    onClick={toggleGallery}
                                >
                                    {galleryOpen ? 'Tutup galeri' : 'Pilih dari galeri'}
                                </button>
                            </div>
                        </div>
                    </div>
                    {galleryOpen && (
                        <div className={styles.gallery}>
                            {galleryLoading && <div className={styles.galleryInfo}>Memuat galeri...</div>}
                            {galleryError && <div className={styles.galleryError}>{galleryError}</div>}
                            {!galleryLoading && !galleryError && gallery.length === 0 && (
                                <div className={styles.galleryInfo}>Belum ada gambar di galeri.</div>
                            )}
                            <div className={styles.galleryGrid}>
                                {gallery.map(url => (
                                    <button
                                        key={url}
                                        type="button"
                                        className={styles.galleryItem}
                                        onClick={() => {
                                            setForm(prev => ({ ...prev, avatar: url }));
                                            setGalleryOpen(false);
                                        }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={url} alt="Avatar option" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.sectionTitle}>Sosial media</div>

                <div className={styles.formGroup}>
                    <label htmlFor="instagram" className={styles.socialLabel}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{color:'#E1306C'}}>
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                        </svg>
                        Instagram
                    </label>
                    <div className={styles.inputIconWrapper}>
                        <span className={styles.inputIconLeft} style={{color:'#E1306C'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                            </svg>
                        </span>
                        <input
                            id="instagram"
                            type="text"
                            name="instagram"
                            value={form.instagram}
                            onChange={handleChange}
                            placeholder="https://instagram.com/yourname"
                            className={`${styles.input} ${styles.inputWithIcon}`}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="twitter" className={styles.socialLabel}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{color:'#000'}}>
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Twitter / X
                    </label>
                    <div className={styles.inputIconWrapper}>
                        <span className={styles.inputIconLeft} style={{color:'#000'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                        </span>
                        <input
                            id="twitter"
                            type="text"
                            name="twitter"
                            value={form.twitter}
                            onChange={handleChange}
                            placeholder="https://twitter.com/yourname"
                            className={`${styles.input} ${styles.inputWithIcon}`}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="linkedin" className={styles.socialLabel}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{color:'#0077b5'}}>
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                    </label>
                    <div className={styles.inputIconWrapper}>
                        <span className={styles.inputIconLeft} style={{color:'#0077b5'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                        </span>
                        <input
                            id="linkedin"
                            type="text"
                            name="linkedin"
                            value={form.linkedin}
                            onChange={handleChange}
                            placeholder="https://linkedin.com/in/yourname"
                            className={`${styles.input} ${styles.inputWithIcon}`}
                        />
                    </div>
                </div>

                <div className={styles.sectionTitle}>Keamanan</div>

                <div className={styles.formGroup}>
                    <label htmlFor="password">New Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current"
                        className={styles.input}
                    />
                    <div className={styles.passwordMeta}>
                        <div className={styles.passwordMeter}>
                            <div
                                className={`${styles.passwordMeterFill} ${
                                    passwordStrength?.level === 'weak'
                                        ? styles.passwordWeak
                                        : passwordStrength?.level === 'medium'
                                        ? styles.passwordMedium
                                        : passwordStrength?.level === 'strong'
                                        ? styles.passwordStrong
                                        : ''
                                }`}
                                style={{
                                    width:
                                        passwordStrength?.level === 'weak'
                                            ? '33%'
                                            : passwordStrength?.level === 'medium'
                                            ? '66%'
                                            : passwordStrength?.level === 'strong'
                                            ? '100%'
                                            : '0%',
                                }}
                            />
                        </div>
                        <span
                            className={
                                passwordStrength?.level === 'weak'
                                    ? styles.passwordLabelWeak
                                    : passwordStrength?.level === 'medium'
                                    ? styles.passwordLabelMedium
                                    : passwordStrength?.level === 'strong'
                                    ? styles.passwordLabelStrong
                                    : styles.hint
                            }
                        >
                            {passwordStrength ? `${passwordStrength.label} · minimal 8 karakter` : 'Minimal 8 karakter, gunakan huruf besar, angka, dan simbol.'}
                        </span>
                    </div>
                    <small className={styles.hint}>Kosongkan jika tidak ingin mengubah password.</small>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repeat new password"
                        className={styles.input}
                    />
                </div>

                <div className={styles.actions}>
                    <button
                        type="submit"
                        disabled={saving}
                        className={styles.submitBtn}
                    >
                        {saving ? (
                            <>
                                <Loader size={18} className={styles.spinning} /> Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                    <Link href={`/profile`} className={styles.cancelBtn}>
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
