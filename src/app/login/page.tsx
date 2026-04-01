'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Flame, ArrowRight, AlertCircle } from 'lucide-react';
import styles from './auth.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Login gagal.'); return; }
            // send admin users to the admin dashboard
            if (data.user?.role === 'ADMIN' || data.user?.role === 'SUPER_ADMIN') {
                router.push('/admin');
            } else {
                router.push('/');
            }
            router.refresh();
        } catch {
            setError('Terjadi kesalahan. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.decorLeft} />
            <div className={styles.decorRight} />

            <div className={styles.card}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <img src="/ikada-logo.png" alt="Disada Logo" draggable="false" />
                    </div>
                    <span className="text-gradient" style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.2rem' }}>Disada</span>
                </Link>

                <div className={styles.heading}>
                    <h1>Selamat datang kembali 👋</h1>
                    <p>Masuk ke akun Disada kamu</p>
                </div>

                {error && (
                    <div className={styles.errorAlert}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-email">Email</label>
                        <div className={styles.inputWrap}>
                            <Mail size={17} className={styles.inputIcon} />
                            <input
                                id="login-email"
                                type="email"
                                className={`form-input ${styles.withIcon}`}
                                placeholder="kamu@email.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="login-password">Password</label>
                        <div className={styles.inputWrap}>
                            <Lock size={17} className={styles.inputIcon} />
                            <input
                                id="login-password"
                                type={showPass ? 'text' : 'password'}
                                className={`form-input ${styles.withIcon} ${styles.withAction}`}
                                placeholder="Masukkan password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                                autoComplete="current-password"
                            />
                            <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                        {loading ? 'Memproses...' : (<>Masuk <ArrowRight size={18} /></>)}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link href={`/auth/forgot-password${form.email ? `?email=${encodeURIComponent(form.email)}` : ''}`} className={styles.forgotLink}>
                        Lupa password?
                    </Link>
                </div>

                <p className={styles.switchText}>
                    Belum punya akun?{' '}
                    <Link href="/register" className={styles.switchLink}>Daftar sekarang</Link>
                </p>
            </div>
        </div>
    );
}
