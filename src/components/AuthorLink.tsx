'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AuthorLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    /** Use when rendered inside another Link - prevents nested anchor */
    stopPropagation?: boolean;
}

/** Link to author profile. Use stopPropagation when inside another Link (e.g. article card) */
export default function AuthorLink({ href, children, className, stopPropagation }: AuthorLinkProps) {
    const router = useRouter();

    if (stopPropagation) {
        return (
            <span
                role="link"
                tabIndex={0}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(href);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        router.push(href);
                    }
                }}
                className={className}
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
                {children}
            </span>
        );
    }

    return (
        <Link href={href} className={className}>
            {children}
        </Link>
    );
}
