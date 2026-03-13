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
                    <label htmlFor="instagram">Instagram</label>
                    <input
                        id="instagram"
                        type="text"
                        name="instagram"
                        value={form.instagram}
                        onChange={handleChange}
                        placeholder="https://instagram.com/yourname"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="twitter">Twitter</label>
                    <input
                        id="twitter"
                        type="text"
                        name="twitter"
                        value={form.twitter}
                        onChange={handleChange}
                        placeholder="https://twitter.com/yourname"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="linkedin">LinkedIn</label>
                    <input
                        id="linkedin"
                        type="text"
                        name="linkedin"
                        value={form.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/yourname"
                        className={styles.input}
                    />
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
