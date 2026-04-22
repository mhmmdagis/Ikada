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

    let program = null;

    try {
        program = await prisma.program.findUnique({
            where: { id: programId, status: 'ACTIVE' },
            include: {
                createdBy: {
                    select: { name: true, id: true },
                },
            },
        });
    } catch (error) {
        console.error('Error fetching program:', error);
        // Continue with notFound if database fails
    }

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

