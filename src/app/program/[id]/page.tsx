import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({ params }: Props) {
    const { id: programId } = await params;

    const program = await prisma.program.findUnique({
        where: { id: programId, status: 'ACTIVE' },
        include: {
            createdBy: {
                select: { name: true },
            },
        },
    });

    if (!program) {
        notFound();
    }

    return (
        <div className="container py-10">
            <Link href="/program" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
                ← Kembali ke daftar program
            </Link>

            <article className="max-w-3xl">
                {program.image && (
                    <div className="mb-6">
                        <img
                            src={program.image}
                            alt={program.title}
                            className="w-full max-h-[360px] object-cover rounded-xl shadow-md"
                        />
                    </div>
                )}

                <h1 className="text-3xl font-bold mb-3">{program.title}</h1>

                <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-gray-500">
                    {program.category && (
                        <span className="badge badge-primary">{program.category}</span>
                    )}
                    <span>
                        Oleh <span className="font-medium">{program.createdBy.name}</span>
                    </span>
                    <span>•</span>
                    <span>{format(new Date(program.createdAt), 'dd MMM yyyy', { locale: id })}</span>
                </div>

                <p className="text-lg text-gray-700 mb-6">
                    {program.description}
                </p>

                {program.content && (
                    <div className="prose prose-slate max-w-none text-gray-800">
                        {program.content.split('\n').map((para, idx) => (
                            <p key={idx}>{para}</p>
                        ))}
                    </div>
                )}
            </article>
        </div>
    );
}

