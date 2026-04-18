'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Tag, Share2 } from 'lucide-react';

interface Program {
    id: string;
    title: string;
    description: string | null;
    content: string | null;
    image: string | null;
    category: string | null;
    createdBy: {
        name: string;
        id: string;
    };
}

interface Props {
    program: Program;
    formattedDate: string;
}

export default function ProgramDetailClient({ program, formattedDate }: Props) {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: program.title,
                text: program.description || '',
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link disalin ke clipboard!');
        }
    };

    return (
        <div className="container py-8 md:py-12">
            {/* Back Button */}
            <Link 
                href="/program" 
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-8 transition-colors"
            >
                <ArrowLeft size={16} />
                Kembali ke Daftar Program
            </Link>

            <article className="max-w-4xl">
                {/* Hero Image */}
                {program.image && (
                    <div className="mb-8 md:mb-10">
                        <div className="relative overflow-hidden rounded-2xl shadow-lg">
                            <img
                                src={program.image}
                                alt={program.title}
                                className="w-full aspect-video object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="mb-8 md:mb-10">
                    {/* Category Badge */}
                    {program.category && (
                        <div className="mb-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-sm font-medium">
                                <Tag size={14} />
                                {program.category}
                            </span>
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                        {program.title}
                    </h1>

                    {/* Meta Information Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        {/* Author */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                {program.createdBy.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Oleh</p>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                    {program.createdBy.name}
                                </p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-12 bg-slate-200 dark:bg-slate-700" />

                        {/* Published Date */}
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-slate-500 dark:text-slate-400" />
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                                {formattedDate}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {program.description && (
                    <div className="mb-8 md:mb-10 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <p className="text-lg text-blue-900 dark:text-blue-100 leading-relaxed font-medium">
                            {program.description}
                        </p>
                    </div>
                )}

                {/* Main Content */}
                {program.content && (
                    <div className="prose prose-slate dark:prose-invert max-w-none mb-10">
                        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                            {program.content.split('\n\n').map((section, idx) => (
                                <div key={idx}>
                                    {section.split('\n').map((para, pIdx) => (
                                        <p key={pIdx} className="text-base md:text-lg">
                                            {para.trim()}
                                        </p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Divider */}
                <hr className="my-10 border-slate-200 dark:border-slate-700" />

                {/* Action Section */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-4">
                    {/* Share Button */}
                    <button 
                        onClick={handleShare}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                    >
                        <Share2 size={16} />
                        Bagikan
                    </button>

                    {/* Back to List */}
                    <Link 
                        href="/program" 
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                        Lihat Program Lain
                    </Link>
                </div>
            </article>
        </div>
    );
}
