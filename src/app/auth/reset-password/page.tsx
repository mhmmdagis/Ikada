'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Loader, CheckCircle } from 'lucide-react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

    useEffect(() => {
        if (!token) {
            setIsValidToken(false);
            setError('Token reset password tidak ditemukan.');
        } else {
            setIsValidToken(true);
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setError('Semua field wajib diisi.');
            return;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Password tidak cocok.');
            return;
        }

        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError(data.error || 'Terjadi kesalahan.');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (isValidToken === false) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '40px',
                    textAlign: 'center',
                    maxWidth: '400px',
                    width: '100%',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}>
                    <Lock size={48} style={{ color: '#ef4444', margin: '0 auto 20px' }} />
                    <h2 style={{ margin: '0 0 10px', color: '#333' }}>Link Tidak Valid</h2>
                    <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
                    <Link href="/auth/forgot-password" style={{
                        display: 'inline-block',
                        background: '#2ec4b6',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        textDecoration: 'none'
                    }}>
                        Minta Link Baru
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '40px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <Link href="/login" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#666',
                    textDecoration: 'none',
                    marginBottom: '20px',
                    fontSize: '14px'
                }}>
                    <ArrowLeft size={16} />
                    Kembali ke Login
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <Lock size={48} style={{ color: '#2ec4b6', margin: '0 auto 20px' }} />
                    <h1 style={{ margin: '0 0 10px', color: '#333' }}>Reset Password</h1>
                    <p style={{ color: '#666' }}>Masukkan password baru Anda.</p>
                </div>

                {message && (
                    <div style={{
                        padding: '12px 16px',
                        background: '#d1fae5',
                        border: '1px solid #10b981',
                        borderRadius: '6px',
                        color: '#065f46',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <CheckCircle size={18} style={{ display: 'inline', marginRight: '8px' }} />
                        {message}
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '12px 16px',
                        background: '#fee2e2',
                        border: '1px solid #ef4444',
                        borderRadius: '6px',
                        color: '#dc2626',
                        marginBottom: '20px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontWeight: '500',
                            marginBottom: '8px',
                            color: '#374151'
                        }}>
                            Password Baru
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimal 6 karakter"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                            }}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontWeight: '500',
                            marginBottom: '8px',
                            color: '#374151'
                        }}>
                            Konfirmasi Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi password baru"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                            }}
                            disabled={loading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: '#2ec4b6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                Mereset...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link href="/auth/forgot-password" style={{ color: '#2ec4b6', textDecoration: 'none', fontSize: '14px' }}>
                        Kirim ulang link reset
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '40px',
                    textAlign: 'center',
                    maxWidth: '400px',
                    width: '100%',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}>
                    <Loader size={48} style={{ color: '#2ec4b6', margin: '0 auto 20px' }} className="animate-spin" />
                    <p style={{ color: '#666' }}>Memuat...</p>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}