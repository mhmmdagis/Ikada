'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

function VerifyEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token verifikasi tidak ditemukan.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const res = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message);
                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        router.push('/login');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(data.error);
                }
            } catch (error) {
                setStatus('error');
                setMessage('Terjadi kesalahan. Silakan coba lagi.');
            }
        };

        verifyEmail();
    }, [token, router]);

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
                {status === 'loading' && (
                    <>
                        <Loader size={48} style={{ color: '#6366f1', margin: '0 auto 20px' }} className="animate-spin" />
                        <h2 style={{ margin: '0 0 10px', color: '#333' }}>Memverifikasi Email...</h2>
                        <p style={{ color: '#666' }}>Mohon tunggu sebentar.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 20px' }} />
                        <h2 style={{ margin: '0 0 10px', color: '#333' }}>Email Berhasil Diverifikasi!</h2>
                        <p style={{ color: '#666', marginBottom: '20px' }}>{message}</p>
                        <p style={{ color: '#666', fontSize: '14px' }}>Anda akan diarahkan ke halaman login dalam 3 detik...</p>
                        <Link href="/login" style={{
                            display: 'inline-block',
                            background: '#6366f1',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            marginTop: '15px'
                        }}>
                            Login Sekarang
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle size={48} style={{ color: '#ef4444', margin: '0 auto 20px' }} />
                        <h2 style={{ margin: '0 0 10px', color: '#333' }}>Verifikasi Gagal</h2>
                        <p style={{ color: '#666', marginBottom: '20px' }}>{message}</p>
                        <Link href="/" style={{
                            display: 'inline-block',
                            background: '#6366f1',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            textDecoration: 'none'
                        }}>
                            Kembali ke Beranda
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
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
                    <Loader size={48} style={{ color: '#6366f1', margin: '0 auto 20px' }} className="animate-spin" />
                    <p style={{ color: '#666' }}>Memverifikasi email...</p>
                </div>
            </div>
        }>
            <VerifyEmailForm />
        </Suspense>
    );
}