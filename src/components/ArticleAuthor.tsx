'use client';

import AuthorLink from './AuthorLink';

interface ArticleAuthorProps {
    author: { id: string; name: string };
    anonymous?: boolean;
    className?: string;
    stopPropagation?: boolean;
}

/** Renders author name or "Anonim" when anonymous. Use inside Link containers for stopPropagation. */
export default function ArticleAuthor({ author, anonymous, className = '', stopPropagation }: ArticleAuthorProps) {
    if (anonymous) {
        return <span className={className}>Anonim</span>;
    }
    return (
        <AuthorLink href={`/profile/${author.id}`} className={className} stopPropagation={stopPropagation}>
            {author.name}
        </AuthorLink>
    );
}
