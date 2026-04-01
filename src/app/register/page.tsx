'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff, Flame, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from '../login/auth.module.css';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const passwordStrength = form.password.length === 0 ? null
        : form.password.length < 6 ? 'weak'
            : form.password.length < 10 ? 'medium'
                : 'strong';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Registrasi gagal.'); return; }
            setSuccess(true);
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
                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 20px' }} />
                        <h1 style={{ margin: '0 0 10px', color: '#333' }}>Pendaftaran Berhasil!</h1>
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                            Kami telah mengirim link verifikasi ke email Anda. Silakan periksa inbox dan klik link untuk mengaktifkan akun.
                        </p>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                            Jika tidak menemukan email, periksa folder spam atau junk.
                        </p>
                        <Link href="/login" className={styles.switchLink}>
                            Kembali ke Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <Link href="/" className={styles.logo}>
                            <div className={styles.logoIcon}>
                                <img src="/ikada-logo.png" alt="Disada Logo" draggable="false" />
                            </div>
                            <span className="text-gradient" style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.2rem' }}>Disada</span>
                        </Link>

                <div className={styles.heading}>
                    <h1>Bergabung dengan Disada ✨</h1>
                    <p>Buat akun dan mulai berbagi ide</p>
                </div>

                {error && (
                    <div className={styles.errorAlert}>
                        <AlertCircle size={16} /><span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-name">Nama Lengkap</label>
                        <div className={styles.inputWrap}>
                            <User size={17} className={styles.inputIcon} />
                            <input id="reg-name" type="text" className={`form-input ${styles.withIcon}`}
                                placeholder="Nama kamu" value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-email">Email</label>
                        <div className={styles.inputWrap}>
                            <Mail size={17} className={styles.inputIcon} />
                            <input id="reg-email" type="email" className={`form-input ${styles.withIcon}`}
                                placeholder="kamu@email.com" value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-password">Password</label>
                        <div className={styles.inputWrap}>
                            <Lock size={17} className={styles.inputIcon} />
                            <input id="reg-password" type={showPass ? 'text' : 'password'}
                                className={`form-input ${styles.withIcon} ${styles.withAction}`}
                                placeholder="Min. 6 karakter" value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })} required />
                            <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {passwordStrength && (
                            <div className={styles.strengthBar}>
                                <div className={`${styles.strengthFill} ${styles[`strength-${passwordStrength}`]}`} />
                                <span className={styles.strengthLabel}>
                                    {passwordStrength === 'weak' ? '⚠️ Lemah' : passwordStrength === 'medium' ? '👍 Cukup' : '✅ Kuat'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className={styles.agreeNote}>
                        <CheckCircle2 size={14} /> Dengan mendaftar, kamu menyetujui syarat dan ketentuan Disada
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.25rem' }} disabled={loading}>
                        {loading ? 'Membuat akun...' : (<>Buat Akun Gratis <ArrowRight size={18} /></>)}
                    </button>
                </form>

                <p className={styles.switchText}>
                    Sudah punya akun?{' '}
                    <Link href="/login" className={styles.switchLink}>Masuk di sini</Link>
                </p>
                    </>
                )}
            </div>
        </div>
    );
}
