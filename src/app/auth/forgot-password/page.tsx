'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Email wajib diisi.');
            return;
        }

        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
            } else {
                setError(data.error || 'Terjadi kesalahan.');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

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
                    <Mail size={48} style={{ color: '#6366f1', margin: '0 auto 20px' }} />
                    <h1 style={{ margin: '0 0 10px', color: '#333' }}>Lupa Password</h1>
                    <p style={{ color: '#666' }}>Masukkan email Anda untuk menerima link reset password.</p>
                </div>

                {message && (
                    <div style={{
                        padding: '12px 16px',
                        background: '#d1fae5',
                        border: '1px solid #10b981',
                        borderRadius: '6px',
                        color: '#065f46',
                        marginBottom: '20px'
                    }}>
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
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontWeight: '500',
                            marginBottom: '8px',
                            color: '#374151'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nama@email.com"
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
                            background: '#6366f1',
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
                                Mengirim...
                            </>
                        ) : (
                            'Kirim Link Reset'
                        )}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link href="/login" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '14px' }}>
                        Ingat password Anda? Login
                    </Link>
                </div>
            </div>
        </div>
    );
}