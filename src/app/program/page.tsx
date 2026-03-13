import React from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';

export default async function ProgramPage() {
    noStore();

    const programs = await prisma.program.findMany({
        where: { status: 'ACTIVE' },
        include: {
            createdBy: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-6">Program Kerja IKADA</h1>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Program Unggulan Kami</h2>
                <p className="mb-6">Dari kegiatan sosial hingga pengembangan profesional, kami merancang program yang relevan dan bermanfaat bagi semua anggota.</p>

                {programs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {programs.map(program => (
                            <div key={program.id} className="card flex flex-col">
                                {program.image && (
                                    <img
                                        src={program.image}
                                        alt={program.title}
                                        className="w-full h-48 object-cover rounded-t-lg"
                                    />
                                )}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-semibold mb-2">{program.title}</h3>
                                    <p className="text-gray-600 mb-4">{program.description}</p>
                                    {program.category && (
                                        <span className="badge badge-primary mb-3">{program.category}</span>
                                    )}
                                    {program.content && (
                                        <div className="text-sm text-gray-500 mb-3">
                                            {program.content.substring(0, 150)}...
                                        </div>
                                    )}
                                    <div className="mt-auto flex items-center justify-between gap-2">
                                        <div className="text-xs text-gray-400">
                                            Dibuat oleh {program.createdBy.name} • {format(new Date(program.createdAt), 'dd MMM yyyy', { locale: id })}
                                        </div>
                                        <Link
                                            href={`/program/${program.id}`}
                                            className="btn btn-ghost btn-xs"
                                        >
                                            Baca selengkapnya
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Belum ada program yang tersedia.</p>
                )}
            </section>

            <p className="text-center text-gray-600">Untuk informasi lebih lanjut tentang program kerja IKADA, tetap terhubung dengan komunitas kami.</p>
        </div>
    );
}