'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function LoadingBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        // Trigger loading when pathname or searchParams change
        const handleStart = () => {
            setLoading(true);
            setWidth(20);
            
            // Artificial progress steps
            const interval = setInterval(() => {
                setWidth(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + Math.random() * 10;
                });
            }, 300);

            return () => clearInterval(interval);
        };

        const handleComplete = () => {
            setWidth(100);
            setTimeout(() => {
                setLoading(false);
                setWidth(0);
            }, 300);
        };

        // Next.js doesn't provide easy events for every route change in App Router inside server components,
        // but we can simulate it with pathname change.
        handleStart();
        const timeout = setTimeout(handleComplete, 400); // Most transitions are fast in Next.js

        return () => clearTimeout(timeout);
    }, [pathname, searchParams]);

    if (!loading && width === 0) return null;

    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '3px',
                background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))',
                width: `${width}%`,
                transition: 'width 0.3s ease, opacity 0.3s ease',
                zIndex: 9999,
                boxShadow: '0 0 10px rgba(46, 196, 182, 0.5)',
                opacity: width === 100 ? 0 : 1
            }} 
        />
    );
}
