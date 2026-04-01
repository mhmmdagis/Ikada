import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({
        success: false,
        error: 'Anda harus login untuk export data.'
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv'; // csv, xlsx, json
    const dataType = searchParams.get('type') || 'all'; // all, articles, forums, comments, events, users

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User tidak ditemukan.'
      }, { status: 404 });
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const userFilter = isAdmin ? {} : { authorId: session.userId };

    // Fetch data based on type
    let exportData: any[] = [];

    if (dataType === 'all' || dataType === 'articles') {
      const articles = await prisma.article.findMany({
        where: userFilter,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          published: true,
          views: true,
          createdAt: true,
          updatedAt: true,
          anonymous: true,
          author: { select: { name: true } },
          category: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      exportData = exportData.concat(articles.map(a => ({
        Tipe: 'Artikel',
        Judul: a.title,
        Kategori: a.category?.name || '-',
        Penulis: a.anonymous ? 'Anonim' : a.author.name,
        Status: a.published ? 'Publish' : 'Draft',
        Views: a.views,
        'Dibuat Pada': new Date(a.createdAt).toLocaleDateString('id-ID'),
        'Diperbarui Pada': new Date(a.updatedAt).toLocaleDateString('id-ID')
      })));
    }

    if (dataType === 'all' || dataType === 'forums') {
      const forums = await prisma.forum.findMany({
        where: userFilter,
        select: {
          id: true,
          title: true,
          content: true,
          views: true,
          createdAt: true,
          updatedAt: true,
          author: { select: { name: true } },
          category: { select: { name: true } },
          _count: { select: { comments: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      exportData = exportData.concat(forums.map(f => ({
        Tipe: 'Diskusi',
        Judul: f.title,
        Kategori: f.category?.name || '-',
        Penulis: f.author.name,
        Views: f.views,
        Komentar: f._count.comments,
        'Dibuat Pada': new Date(f.createdAt).toLocaleDateString('id-ID'),
        'Diperbarui Pada': new Date(f.updatedAt).toLocaleDateString('id-ID')
      })));
    }

    if (dataType === 'all' || dataType === 'comments') {
      const comments = await prisma.comment.findMany({
        where: userFilter,
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: { select: { name: true } },
          article: { select: { title: true } },
          forum: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      exportData = exportData.concat(comments.map(c => ({
        Tipe: 'Komentar',
        Konten: c.content.substring(0, 100),
        'Pada': c.article?.title || c.forum?.title || '-',
        Penulis: c.author.name,
        'Dibuat Pada': new Date(c.createdAt).toLocaleDateString('id-ID')
      })));
    }

    if ((dataType === 'all' || dataType === 'events') && isAdmin) {
      const events = await prisma.event.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          location: true,
          type: true,
          status: true,
          createdAt: true
        },
        orderBy: { date: 'desc' }
      });

      exportData = exportData.concat(events.map(e => ({
        Tipe: 'Event',
        Judul: e.title,
        Lokasi: e.location,
        Jenis: e.type,
        Status: e.status,
        Tanggal: new Date(e.date).toLocaleDateString('id-ID'),
        'Dibuat Pada': new Date(e.createdAt).toLocaleDateString('id-ID')
      })));
    }

    if ((dataType === 'all' || dataType === 'users') && isAdmin) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          bio: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { articles: true, forums: true, comments: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      exportData = exportData.concat(users.map(u => ({
        Tipe: 'Pengguna',
        Nama: u.name,
        Username: u.username,
        Email: u.email,
        Role: u.role,
        'Email Verified': u.emailVerified ? 'Ya' : 'Tidak',
        Artikel: u._count.articles,
        Diskusi: u._count.forums,
        Komentar: u._count.comments,
        'Bergabung': new Date(u.createdAt).toLocaleDateString('id-ID')
      })));
    }

    // Generate file based on format
    let fileContent: any;
    let filename: string;
    let contentType: string;

    if (format === 'xlsx') {
      // Generate Excel file
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      
      // Set column widths
      const maxWidth = 20;
      const colWidths = Object.keys(exportData[0] || {}).map(() => maxWidth);
      ws['!cols'] = colWidths.map(w => ({ wch: w }));

      fileContent = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
      filename = `dashboard-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (format === 'json') {
      // Generate JSON file
      fileContent = JSON.stringify(exportData, null, 2);
      filename = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
      contentType = 'application/json';
    } else {
      // Generate CSV file (default)
      if (exportData.length === 0) {
        fileContent = '';
      } else {
        const headers = Object.keys(exportData[0]);
        const csv = [
          headers.join(','),
          ...exportData.map(row =>
            headers.map(header => {
              const value = row[header] || '';
              // Escape quotes and wrap in quotes if contains comma
              const escaped = String(value).replace(/"/g, '""');
              return escaped.includes(',') ? `"${escaped}"` : escaped;
            }).join(',')
          )
        ].join('\n');
        fileContent = csv;
      }
      filename = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
      contentType = 'text/csv;charset=utf-8';
    }

    // Return file
    if (format === 'xlsx') {
      return new NextResponse(fileContent, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Type': contentType
        }
      });
    } else {
      return new NextResponse(fileContent, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Type': contentType
        }
      });
    }

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan saat export data.'
    }, { status: 500 });
  }
}
