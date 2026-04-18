import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import ProgramDetailClient from './ProgramDetailClient';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({ params }: Props) {
    const { id: programId } = await params;

    const program = await prisma.program.findUnique({
        where: { id: programId, status: 'ACTIVE' },
        include: {
            createdBy: {
                select: { name: true, id: true },
            },
        },
    });

    if (!program) {
        notFound();
    }

    const formattedDate = format(new Date(program.createdAt), 'dd MMMM yyyy', { locale: id });

    return (
        <ProgramDetailClient 
            program={program}
            formattedDate={formattedDate}
        />
    );
}
}

