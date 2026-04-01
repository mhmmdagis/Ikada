# 📚 DOKUMENTASI LENGKAP PLATFORM DISADA

**Versi:** 0.1.0  
**Tanggal:** 17 Maret 2026  
**Platform:** Next.js 16 + Prisma + PostgreSQL  
**Status:** Development

---

## 📋 DAFTAR ISI

1. [Gambaran Umum](#gambaran-umum)
2. [Teknologi & Stack](#teknologi--stack)
3. [Model Data (Database)](#model-data-database)
4. [Fitur-Fitur Utama](#fitur-fitur-utama)
5. [Flow Autentikasi](#flow-autentikasi)
6. [API Endpoints](#api-endpoints)
7. [Halaman & UI](#halaman--ui)
8. [Admin Panel](#admin-panel)
9. [Cara Kerja Fitur Khusus](#cara-kerja-fitur-khusus)
10. [Database Migrations](#database-migrations)

---

## 🎯 GAMBARAN UMUM

**Disada** adalah platform komunitas digital yang dirancang untuk memfasilitasi berbagi pengetahuan, diskusi, dan kolaborasi. Platform ini menyediakan ruang untuk:

- 📝 **Penulisan & Publikasi Artikel** - Menulis, mengedit, dan mempublikasikan konten
- 💬 **Forum Diskusi** - Berdiskusi dengan komunitas secara terstruktur
- 🎨 **Galeri** - Menampilkan dan mengelola galeri gambar/karya visual
- 📆 **Event Management** - Kelola event/acara komunitas
- 🎓 **Program** - Dokumentasi program dan inisiatif khusus
- 👤 **Profil Pengguna** - Kelola profil dan portofolio personal
- 🛡️ **Admin Dashboard** - Kelola semua aspek platform

---

## 🛠️ TEKNOLOGI & STACK

### Frontend
- **Next.js 16.1.6** - React framework dengan App Router
- **React 19.2.3** - UI library
- **EasyMDE 2.20** - Markdown editor untuk menulis
- **React Quill 2.0** - Rich text editor
- **React Markdown 10.1** - Markdown renderer
- **Lucide React 0.575** - Icon library

### Backend
- **Next.js API Routes** - Serverless functions untuk API
- **Prisma 6.4** - ORM untuk database
- **PostgreSQL** - Database utama

### Authentication & Security
- **Iron Session 8.0** - Session management (cookie-based)
- **bcryptjs 3.0** - Password hashing
- **UUID (CUID)** - Unique identifiers

### Email & Utilities
- **Resend 6.9** - Email delivery service
- **date-fns 4.1** - Date formatting & manipulation
- **XLSX 0.18** - Excel export

### Development Tools
- **TypeScript 5** - Type safety
- **ESLint 9** - Code linting
- **Prisma CLI** - Database management

---

## 📊 MODEL DATA (DATABASE)

### 1. **User** - Pengguna Platform
```typescript
{
  id: string (CUID - unique identifier)
  username: string (unique)
  name: string
  email: string (unique)
  password: string (hashed with bcryptjs)
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  
  // Profile Info
  bio: string?
  major: string? (bidang studi/keahlian)
  batch: string? (tahun/angkatan)
  avatar: string? (URL profil picture)
  instagram: string? (social media)
  twitter: string?
  linkedin: string?
  
  // Email Verification
  emailVerified: boolean
  emailVerificationToken: string?
  
  // Password Reset
  passwordResetToken: string?
  passwordResetExpires: DateTime?
  
  // Relations
  articles: Article[]
  forums: Forum[]
  comments: Comment[]
  likes: Like[]
  galleryItems: GalleryItem[]
  programs: Program[]
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 2. **Article** - Artikel/Tulisan
```typescript
{
  id: string (unique)
  title: string
  slug: string (unique, auto-generated from title + timestamp)
  customSlug: string? (custom URL slug)
  content: string (Markdown atau HTML)
  excerpt: string? (preview text)
  cover: string? (cover image URL)
  thumbnail: string? (preview image untuk listing)
  
  // Publishing Status
  published: boolean
  visibility: 'PUBLIC' | 'DRAFT' | 'UNLISTED' | 'PRIVATE'
  scheduledAt: DateTime? (untuk scheduled publishing)
  
  // Features
  views: int (counter)
  allowComments: boolean (enable/disable komentar)
  anonymous: boolean (hide author identity)
  tags: string[] (array of tags)
  attachments: string[] (URLs of attached files)
  
  // SEO
  metaTitle: string?
  metaDescription: string?
  
  // Relations
  authorId: string (User.id)
  author: User
  categoryId: string? (Category.id)
  category: Category?
  likes: Like[]
  comments: Comment[]
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 3. **Category** - Kategori Konten
```typescript
{
  id: string (unique)
  name: string (unique)
  slug: string (unique)
  color: string (hex color, default: #6366f1)
  
  // Relations
  articles: Article[]
  forums: Forum[]
  
  createdAt: DateTime
}
```

### 4. **Forum** - Thread Diskusi
```typescript
{
  id: string (unique)
  title: string
  content: string (post content)
  views: int
  pinned: boolean (pin di atas forum list)
  
  // Relations
  authorId: string (User.id)
  author: User
  categoryId: string? (Category.id)
  category: Category?
  comments: Comment[]
  likes: Like[]
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 5. **Comment** - Komentar (untuk Article & Forum)
```typescript
{
  id: string (unique)
  content: string (komentar text)
  
  // Relations
  authorId: string (User.id)
  author: User
  articleId: string? (Article.id - null jika forum comment)
  article: Article?
  forumId: string? (Forum.id - null jika article comment)
  forum: Forum?
  
  // Nested Replies (komentar balasan)
  parentId: string? (Comment.id - null jika main comment)
  parent: Comment?
  replies: Comment[] (array of replies)
  
  // Features
  likes: Like[]
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 6. **Like** - Sistem Like/Favorit
```typescript
{
  id: string (unique)
  
  // Relations (polimorfik - bisa like article, forum, atau comment)
  userId: string (User.id)
  user: User
  articleId: string? (null jika forum/comment)
  article: Article?
  forumId: string? (null jika article/comment)
  forum: Forum?
  commentId: string? (null jika article/forum)
  comment: Comment?
  
  // Constraints
  @@unique([userId, articleId]) - 1 like per user per article
  @@unique([userId, forumId])
  @@unique([userId, commentId])
  
  createdAt: DateTime
}
```

### 7. **Event** - Event/Acara
```typescript
{
  id: string (unique)
  title: string
  description: string
  content: string? (detailed description)
  date: DateTime (event start time)
  endDate: DateTime? (event end time)
  location: string (lokasi)
  image: string? (event image URL)
  
  // Type & Status
  type: 'ONLINE' | 'OFFLINE' | 'HYBRID'
  status: 'UPCOMING' | 'ONGOING' | 'ENDED'
  
  // Additional Info
  organizer: string?
  link: string? (event link/registration)
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 8. **GalleryItem** - Item Galeri
```typescript
{
  id: string (unique)
  url: string (image URL)
  category: string? (simple category string)
  categoryId: string? (GalleryCategory.id)
  categoryRel: GalleryCategory? (category relation)
  
  // Relations
  uploadedById: string (User.id)
  uploadedBy: User
  
  createdAt: DateTime
}
```

### 9. **GalleryCategory** - Kategori Galeri
```typescript
{
  id: string (unique)
  name: string (unique)
  slug: string (unique)
  color: string (hex color, default: #6366f1)
  
  // Relations
  galleryItems: GalleryItem[]
  
  createdAt: DateTime
}
```

### 10. **Program** - Program/Inisiatif
```typescript
{
  id: string (unique)
  title: string
  description: string
  content: string? (detailed description)
  image: string? (program image)
  icon: string? (program icon)
  
  // Category
  category: string? (simple category, legacy)
  categoryId: string? (ProgramCategory.id)
  categoryRel: ProgramCategory? (category relation)
  
  // Status
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  
  // Relations
  createdById: string (User.id)
  createdBy: User
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 11. **ProgramCategory** - Kategori Program
```typescript
{
  id: string (unique)
  name: string (unique)
  slug: string (unique)
  color: string (hex color, default: #6366f1)
  
  // Relations
  programs: Program[]
  
  createdAt: DateTime
}
```

---

## 🎯 FITUR-FITUR UTAMA

### 1️⃣ AUTENTIKASI & AKUN PENGGUNA

#### Fitur Authentication:
- ✅ **Register** - Pendaftaran akun baru
- ✅ **Login** - Login dengan email & password
- ✅ **Logout** - Keluar dari akun
- ✅ **Email Verification** - Verifikasi email untuk keamanan
- ✅ **Forgot Password** - Request reset password
- ✅ **Reset Password** - Ubah password dengan token

#### Cara Kerja:
1. User mendaftar dengan email & password
2. Password di-hash menggunakan bcryptjs (keamanan)
3. Email verifikasi dikirim via Resend email service
4. User click link di email untuk verifikasi
5. Session disimpan dalam cookie encrypted (Iron Session)
6. User login dengan email + password, session dibuat
7. Session berlaku 7 hari, secure di production

#### Session Management:
- Menggunakan **Iron Session** (cookie-based)
- Secret key di `.env.local` (`SESSION_SECRET`)
- Menyimpan: `userId`, `name`, `email`, `role`, `isLoggedIn`

---

### 2️⃣ ARTIKEL & PUBLISH SYSTEM

#### Fitur:
- ✅ **Tulis Artikel** - Create artikel dengan Markdown/HTML editor
- ✅ **Draft & Schedule** - Simpan draft atau schedule publish
- ✅ **Visibility Control** - PUBLIC, DRAFT, UNLISTED, PRIVATE
- ✅ **Anonymous Publishing** - Publikasi tanpa nama penulis
- ✅ **Custom Slug** - URL kustom atau auto-generated
- ✅ **MEO Metadata** - Set meta title & description
- ✅ **Kategori & Tags** - Organize dengan kategori dan tags
- ✅ **Komentar** - Readers bisa comment artikel
- ✅ **Like/Favorit** - Pembaca bisa like artikel
- ✅ **View Counter** - Track views artikel

#### Cara Kerja:
1. User login → klik "Tulis Artikel"
2. Editor: Title, Content, Category, Tags, Thumbnail, dll
3. Pilih visibility (PUBLIC/DRAFT/UNLISTED/PRIVATE)
4. Optional: Schedule untuk publish di waktu tertentu
5. Submit → Article dibuat di database
6. Publish atau schedule otomatis

#### Data Flow:
```
POST /api/articles
{
  title: "Judul Artikel",
  content: "Isi artikel",
  categoryId: "cat_123",
  visibility: "PUBLIC",
  scheduledAt: "2026-03-20T10:00:00Z",
  anonymous: false,
  allowComments: true,
  tags: ["tag1", "tag2"],
  metaTitle: "SEO Title",
  metaDescription: "SEO Description"
}
```

---

### 3️⃣ FORUM DISKUSI

#### Fitur:
- ✅ **Create Forum Thread** - Buat thread diskusi baru
- ✅ **Kategori Forum** - Organize diskusi dengan kategori
- ✅ **Pin Thread** - Admin bisa pin penting thread
- ✅ **Komentar & Diskusi** - Reply dalam thread
- ✅ **Nested Replies** - Komentar balasan (multi-level)
- ✅ **Like & Vote** - Community voting system
- ✅ **View Counter** - Track engagement

#### Cara Kerja:
1. User login → klik "Forum Baru"
2. Tulis judul + konten diskusi
3. Pilih kategori (opsional)
4. Submit → Forum thread dibuat
5. Orang lain bisa reply → threading comments
6. Community bisa like comments untuk vote best answer

---

### 4️⃣ SISTEM KOMENTAR BERSTRUKTUR

#### Fitur:
- ✅ **Comment pada Article** - Komentar artikel
- ✅ **Comment pada Forum** - Komentar thread forum
- ✅ **Nested Replies** - Balas komentar lain (multi-level)
- ✅ **Like Comment** - Community vote untuk komentar
- ✅ **Cascade Delete** - Hapus comment = hapus yang di-balas

#### Schema:
```typescript
Comment {
  id: primary key
  content: text
  authorId: FK User
  articleId: FK Article (atau null)
  forumId: FK Forum (atau null)
  parentId: FK Comment (atau null - untuk replies)
  replies: Comment[] (rekursif untuk nested)
}
```

---

### 5️⃣ GALERI VISUAL

#### Fitur:
- ✅ **Upload Gambar** - Upload ke galeri
- ✅ **Kategori Galeri** - Organize gambar dengan kategori
- ✅ **Gallery View** - Lihat galeri dengan preview

#### Cara Kerja:
1. User upload gambar
2. Gambar disimpan di `public/uploads/`
3. Metadata disimpan di database (GalleryItem)
4. Bisa browse dengan filter kategori

---

### 6️⃣ EVENT MANAGEMENT

#### Fitur:
- ✅ **Create Event** - Admin buat event baru
- ✅ **Event Type** - ONLINE, OFFLINE, HYBRID
- ✅ **Event Status** - UPCOMING, ONGOING, ENDED
- ✅ **Event Details** - Lokasi, tanggal, link, organizer

#### Struktur:
```typescript
Event {
  title: string
  description: string
  date: DateTime (start)
  endDate: DateTime? (end)
  location: string
  type: 'ONLINE' | 'OFFLINE' | 'HYBRID'
  status: 'UPCOMING' | 'ONGOING' | 'ENDED'
  link: string? (registration/zoom)
}
```

---

### 7️⃣ PROGRAM & INISIATIF

#### Fitur:
- ✅ **Program Management** - Admin kelola program
- ✅ **Program Categories** - Organize program
- ✅ **Status Tracking** - ACTIVE, INACTIVE, ARCHIVED

#### Penggunaan:
- Dokumentasi program khusus
- Inisiatif komunitas
- Project showcase

---

### 8️⃣ PROFIL PENGGUNA

#### Fitur:
- ✅ **Public Profile** - Profil visible untuk semua
- ✅ **Profile Edit** - User edit data mereka
- ✅ **Bio & Social** - Bio, Instagram, Twitter, LinkedIn
- ✅ **Major & Batch** - Bidang studi & angkatan
- ✅ **Author Page** - Lihat semua artikel user

#### Data yang bisa di-edit:
- Name, Bio, Major, Batch
- Avatar (profile picture)
- Social media links
- Email & Password

---

### 9️⃣ DASHBOARD USER

#### Fitur:
- ✅ **Dashboard Personal** - Overview aktivitas user
- ✅ **Statistik** - View, like, comment count
- ✅ **Quick Access** - Link ke artikel, forum, profil
- ✅ **Export Data** - Export dashboard ke Excel

#### Info yang ditampilkan:
- Total artikel, forum, komentar
- Total views, likes
- Recent activity
- Popular content

---

### 🔟 ADMIN PANEL

#### Fitur Management:
- ✅ **Manage Users** - Lihat, edit, hapus user
- ✅ **Manage Articles** - Approve, edit, delete artikel
- ✅ **Manage Forum** - Moderate forum threads
- ✅ **Manage Comments** - Delete spam/inappropriate comments
- ✅ **Manage Categories** - CRUD kategori
- ✅ **Manage Events** - CRUD events
- ✅ **Manage Gallery** - Manage images & categories
- ✅ **Manage Programs** - Manage programs
- ✅ **Platform Statistics** - View platform metrics

#### Access Control:
- Hanya `ADMIN` dan `SUPER_ADMIN` yang bisa akses
- Protected oleh middleware routing
- Super admin bisa kelola admin lain

---

## 🔐 FLOW AUTENTIKASI

### Pendaftaran (Register):
```
1. User ke /register
2. Input: email, name, password, username
3. POST /api/auth/register
4. Server: Hash password dengan bcryptjs
5. Create User di database
6. Send email verifikasi
7. Redirect ke /login dengan pesan "Check email"
```

### Login:
```
1. User ke /login
2. Input: email, password
3. POST /api/auth/login
4. Server: 
   - Cari user by email
   - Compare password dengan hash
   - Jika match → Create session (Iron Session)
   - Session disimpan dalam encrypted cookie
5. Redirect ke dashboard
```

### Email Verifikasi:
```
1. User terima email dengan link
2. Click link → /auth/verify-email?token=xxx
3. POST /api/auth/verify-email dengan token
4. Server: Cari email verification token di database
5. Set emailVerified = true
6. Redirect ke /login "Email verified!"
```

### Lupa Password:
```
1. User ke /auth/forgot-password
2. Input: email
3. POST /api/auth/forgot-password
4. Server:
   - Generate reset token
   - Set passwordResetExpires = now + 1 hour
   - Send email dengan reset link
5. Redirect "Check email untuk reset link"
```

### Reset Password:
```
1. User click link di email
2. Ke /auth/reset-password?token=xxx
3. Input: new password
4. POST /api/auth/reset-password
5. Server:
   - Cari token di database
   - Check tidak expired (< 1 jam)
   - Hash password baru
   - Update user password
   - Clear reset token
6. Redirect ke /login "Password updated!"
```

### Session Management:
```
Iron Session Configuration:
- Cookie name: disada_session
- Expires: 7 days
- Secure: true (production only)
- HttpOnly: true (default)
- Session contains: userId, name, email, role, isLoggedIn
```

---

## 📡 API ENDPOINTS

### 🔓 PUBLIC ENDPOINTS

#### Authentication
```
POST   /api/auth/register              - Daftar akun baru
POST   /api/auth/login                 - Login
POST   /api/auth/logout                - Logout
POST   /api/auth/forgot-password       - Request reset password
POST   /api/auth/reset-password        - Reset password
POST   /api/auth/verify-email          - Verifikasi email
GET    /api/auth/me                    - Get current user info
```

#### Articles (Public Read)
```
GET    /api/articles                   - List artikel (dengan filter cat, q)
GET    /api/articles/[slug]            - Detail artikel
GET    /api/articles/[slug]/comments   - List comments artikel
POST   /api/articles/[slug]/like       - Like/unlike artikel
```

#### Forums (Public Read)
```
GET    /api/forums                     - List forum threads
GET    /api/forums/[id]                - Detail forum thread
GET    /api/forums/[id]/comments       - List comments forum
POST   /api/forums/[id]/like           - Like forum thread
```

#### Categories
```
GET    /api/categories                 - List semua kategori
```

#### Search
```
GET    /api/search?q=keyword           - Search global
```

#### User Profile
```
GET    /api/profile                    - Get own profile
PUT    /api/profile                    - Update own profile
GET    /api/auth/profile               - Alternative profile endpoint
```

---

### 🔒 PROTECTED ENDPOINTS (Login Required)

#### User Articles
```
POST   /api/articles                   - Create artikel baru
PUT    /api/articles/[slug]            - Update artikel (author only)
DELETE /api/articles/[slug]            - Delete artikel (author only)
POST   /api/articles/[slug]/comments   - Create comment (login required)
```

#### User Forums
```
POST   /api/forums                     - Create forum thread
PUT    /api/forums/[id]                - Update forum (author only)
DELETE /api/forums/[id]                - Delete forum (author only)
POST   /api/forums/[id]/comments       - Comment on forum
```

#### Comments
```
DELETE /api/comments/[id]              - Delete own comment
POST   /api/comments/[id]/like         - Like comment
```

#### Dashboard
```
GET    /api/dashboard                  - Get user dashboard
GET    /api/dashboard/export           - Export dashboard data
```

#### Gallery
```
GET    /api/gallery                    - List gallery items
POST   /api/gallery                    - Upload to gallery
```

#### Upload
```
POST   /api/upload                     - Upload file
GET    /api/uploads                    - Get uploaded files
```

---

### 👑 ADMIN ENDPOINTS (Admin Only)

#### User Management
```
GET    /api/admin/users                - List all users
PUT    /api/admin/users/[id]           - Update user
DELETE /api/admin/users/[id]           - Delete user
```

#### Content Management
```
GET    /api/admin/articles             - List all articles
PUT    /api/admin/articles/[id]        - Edit article
DELETE /api/admin/articles/[id]        - Delete article

GET    /api/admin/forums               - List all forums
PUT    /api/admin/forums/[id]          - Edit forum
DELETE /api/admin/forums/[id]          - Delete forum

GET    /api/admin/comments             - List all comments
DELETE /api/admin/comments/[id]        - Delete comment
```

#### Gallery Management
```
GET    /api/admin/galleries            - Manage gallery
GET    /api/admin/gallery-categories   - Manage gallery categories
```

#### Event Management
```
GET    /api/admin/events               - List all events
POST   /api/admin/events               - Create event
PUT    /api/admin/events/[id]          - Update event
DELETE /api/admin/events/[id]          - Delete event
```

#### Program Management
```
GET    /api/admin/programs             - List all programs
POST   /api/admin/programs             - Create program
PUT    /api/admin/programs/[id]        - Update program
DELETE /api/admin/programs/[id]        - Delete program

GET    /api/admin/program-categories   - Manage categories
```

#### Category Management
```
GET    /api/admin/categories           - List categories
PUT    /api/admin/categories/[id]      - Edit category
DELETE /api/admin/categories/[id]      - Delete category
```

#### Statistics
```
GET    /api/admin/stats                - Platform statistics
```

---

## 📄 HALAMAN & UI

### 🏠 PUBLIC PAGES

| Route | File | Deskripsi |
|-------|------|-----------|
| `/` | `app/page.tsx` | Halaman home |
| `/about` | `app/about/page.tsx` | Tentang platform |
| `/writings` | `app/writings/page.tsx` | List artikel |
| `/forum` | `app/forums/page.tsx` | List forum threads |
| `/galleries` | `app/gallery/page.tsx` | List galeri gambar |
| `/program` | `app/program/page.tsx` | List program |
| `/events` | `app/events/page.tsx` | List events |
| `/search` | `app/search/page.tsx` | Search hasil |

### 🔐 AUTH PAGES

| Route | File | Deskripsi |
|-------|------|-----------|
| `/login` | `app/login/page.tsx` | Login page |
| `/register` | `app/register/page.tsx` | Register page |
| `/auth/forgot-password` | `app/auth/forgot-password/page.tsx` | Lupa password form |
| `/auth/reset-password` | `app/auth/reset-password/page.tsx` | Reset password form |
| `/auth/verify-email` | `app/auth/verify-email/page.tsx` | Email verification |

### 👤 USER PAGES

| Route | File | Protected | Deskripsi |
|-------|------|-----------|-----------|
| `/profile` | `app/profile/page.tsx` | No | List/redirect profil |
| `/profile/[id]` | `app/profile/[id]/page.tsx` | No | View profil user |
| `/profile/edit` | `app/profile/edit/page.tsx` | **Yes** | Edit profil sendiri |
| `/dashboard` | `app/dashboard/page.tsx` | **Yes** | Personal dashboard |
| `/writings/new` | `app/writings/new/page.tsx` | **Yes** | Tulis artikel baru |
| `/forums/new` | `app/forums/new/page.tsx` | **Yes** | Buat forum baru |

### 🛡️ ADMIN PAGES (Admin Only)

| Route | File | Deskripsi |
|-------|------|-----------|
| `/admin` | `app/admin/page.tsx` | Admin dashboard |
| `/admin/users` | `app/admin/users/page.tsx` | Manage users |
| `/admin/articles` | `app/admin/articles/page.tsx` | Manage articles |
| `/admin/forums` | `app/admin/forums/page.tsx` | Manage forums |
| `/admin/comments` | `app/admin/comments/page.tsx` | Manage comments |
| `/admin/categories` | `app/admin/categories/page.tsx` | Manage categories |
| `/admin/events` | `app/admin/events/page.tsx` | Manage events |
| `/admin/galleries` | `app/admin/galleries/page.tsx` | Manage galleries |
| `/admin/programs` | `app/admin/programs/page.tsx` | Manage programs |

### 🛠️ MIDDLEWARE PROTECTION

File: `src/middleware.ts`

```typescript
Proteksi:
- /admin/* → Hanya ADMIN & SUPER_ADMIN
- /writings/new → Login required
- /forums/new → Login required
- /profile/edit → Login required

Jika tidak authorized → redirect ke /login?next=[original_path]
```

---

## 🛡️ ADMIN PANEL

### Akses Admin:
```
Role Hierarki:
1. SUPER_ADMIN - Akses semua, bisa manage admin lain
2. ADMIN       - Akses panel admin, manage content
3. USER        - Role normal, hanya content creator
```

### Fitur Admin:
- Approve/reject artikel sebelum publish
- Moderate forum threads & comments
- Delete spam atau konten inappropriate
- Manage users (ban, role change)
- Manage categories & tags
- View platform statistics
- Export reports
- Create events & programs

### Setup Admin:
```bash
npm run create-admin

# Script location: scripts/create-admin.ts
# Membuat SUPER_ADMIN dengan:
# - Email: agismuhammadabduh296@gmail.com
# - Name: Super Admin Disada
# - Password: admin123 (change after first login)
```

---

## 💡 CARA KERJA FITUR KHUSUS

### 1. SCHEDULED PUBLISHING

**Konsep:** Artikel bisa dijadwalkan untuk dipublikasi di waktu tertentu.

**Flow:**
```
1. User buat artikel dengan visibility: SCHEDULED
2. Set scheduledAt: "2026-03-20T10:00:00Z"
3. Artikel tersimpan tapi published: false
4. Setiap kali listing artikel di-fetch:
   - WHERE published = true AND visibility = PUBLIC
   - AND (scheduledAt IS NULL OR scheduledAt <= now)
5. Pas waktu tiba, artikel mulai tampil
```

### 2. ANONYMOUS PUBLISHING

**Konsep:** Author bisa publish tanpa menunjukkan nama mereka.

**Flow:**
```
1. Check field `anonymous: true` di artikel
2. UI tampilkan "Penulis Anonim" atau "Tulisan Anonim"
3. Author ID tetap disimpan di database (untuk internal tracking)
4. Author bisa track artikel mereka via dashboard
```

### 3. VISIBILITY LEVELS

**PUBLIC** - Visible untuk semua, bisa di-search
**DRAFT** - Hanya author yang bisa lihat
**UNLISTED** - Bisa diakses via direct link, tidak di-search/listing
**PRIVATE** - Hanya author yang bisa lihat

**Query Filter:**
```typescript
// Untuk public listing
WHERE published = true 
AND visibility = 'PUBLIC'
AND (scheduledAt IS NULL OR scheduledAt <= now)

// Untuk view own drafts
WHERE authorId = currentUserId 
AND visibility IN ('DRAFT', 'PRIVATE')
```

### 4. COMMENT THREADING (Nested Replies)

**Konsep:** Komentar bisa di-reply, membentuk thread diskusi.

**Schema:**
```
Comment {
  id: "c1"
  parentId: null        ← Main comment
  content: "Main..."
  replies: [
    {
      id: "c2"
      parentId: "c1"    ← Reply to c1
      content: "Reply 1..."
      replies: [
        {
          id: "c3"
          parentId: "c2"  ← Reply to c2 (nested)
          content: "Reply to reply..."
        }
      ]
    }
  ]
}
```

**Render:**
```
Comment 1
├─ Reply 1
│  └─ Reply to Reply 1
├─ Reply 2
└─ Reply 3
```

### 5. LIKE SYSTEM (Polimorfik)

**Konsep:** Like bisa di-apply ke Article, Forum, atau Comment.

**Schema:**
```
Like {
  userId: user who liked
  articleId: xxx (null jika bukan article)
  forumId: xxx (null jika bukan forum)
  commentId: xxx (null jika bukan comment)
}

Constraints:
- @@unique([userId, articleId])
  → Satu user hanya bisa like 1x per article
```

**Logic:**
```
// Toggle like
GET /api/articles/[slug]/like
{
  "isLiked": false,
  "likeCount": 5
}

// Toggle on/off:
POST /api/articles/[slug]/like
→ Cek apakah sudah ada Like record
→ Jika ada: DELETE (unlike)
→ Jika tidak: CREATE (like)
```

### 6. VIEW COUNTER

**Konsep:** Track berapa kali artikel/forum di-view.

**Implementation:**
```typescript
// Setiap kali artikel di-akses:
await prisma.article.update({
  where: { slug },
  data: { views: { increment: 1 } }
})

// Display di listing:
ORDER BY views DESC (Most Popular)
```

### 7. SEARCH FUNCTIONALITY

**Konsep:** Search global di artikel, forum, user.

**Query:**
```
GET /api/search?q=keyword

Cari di:
- Article: title, content
- Forum: title, content
- User: name, username, bio
```

### 8. FILE UPLOAD

**Lokasi:** `public/uploads/`

**Flow:**
```
1. POST /api/upload
2. File disimpan ke public/uploads/
3. Return URL: /uploads/filename
4. Metadata disimpan di GalleryItem
5. User bisa browse di /gallery
```

---

## 🗂️ DATABASE MIGRATIONS

Sistem menggunakan Prisma migrations untuk version control database schema.

### Migration Files (Chronological):
```
migrations/
├── 20260302132909_init/
│   └── migration.sql           ← Initial schema: users, articles, etc
├── 20260302183717_add_profile_fields/
│   └── migration.sql           ← Add bio, avatar, social media
├── 20260303101642_add_article_features/
│   └── migration.sql           ← Add meta, tags, attachments
├── 20260307025152_add_article_comments/
│   └── migration.sql           ← Add comments system
├── 20260307173128_add_email_verification/
│   └── migration.sql           ← Email verification fields
├── 20260308182532_add_program_model/
│   └── migration.sql           ← Add Program model
├── 20260309120000_add_article_anonymous/
│   └── migration.sql           ← Add anonymous field
├── 20260310175615_add_gallery_category/
│   └── migration.sql           ← Add GalleryCategory
├── 20260317120000_comment_replies_and_likes/
│   └── migration.sql           ← Add nested comments & likes
├── 20260317130000_add_user_major_batch/
│   └── migration.sql           ← Add major & batch fields
├── 20260317131000_add_program_category_relations/
│   └── migration.sql           ← Link programs to categories
└── 20260317132000_add_galleryitem_categoryid/
    └── migration.sql           ← Add categoryId to GalleryItem
```

### Jalankan Migrations:
```bash
# Apply pending migrations
npx prisma migrate deploy

# Create new migration
npx prisma migrate dev --name [migration_name]

# Reset database (WARNING: destroys data!)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Seed Data:
```bash
# Jalankan seed script
npm run prisma:seed

# atau
npx ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts
```

---

## 🚀 QUICK START

### 1. Setup Environment:
```bash
# Copy .env.local.example → .env.local
cp .env.local.example .env.local

# Set variables:
DATABASE_URL=postgresql://user:password@localhost:5432/disada
SESSION_SECRET=your-secret-key-here
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@disada.com
```

### 2. Setup Database:
```bash
# Install Prisma
npm install

# Create database & run migrations
npx prisma migrate dev

# Seed data
npm run prisma:seed
```

### 3. Create Admin:
```bash
npm run create-admin
```

### 4. Run Development:
```bash
npm run dev

# Open http://localhost:3000
```

### 5. Build & Deploy:
```bash
npm run build
npm run start
```

---

## 📊 TECH ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────┐
│              DISADA PLATFORM                         │
└─────────────────────────────────────────────────────┘
           │
    ┌──────┼──────┐
    │      │      │
┌───▼──┐  │   ┌──▼───┐
│Browser│  │   │Mobile │
│(SPA)  │  │   │App(?) │
└───┬──┘  │   └──┬───┘
    │     │      │
    └─────┼──────┘
          │
    ┌─────▼──────────────────┐
    │  NEXT.JS SERVER        │
    │  (App Router)          │
    └─────┬──────────────────┘
          │
    ┌─────┴──────────────────────────────┐
    │                                     │
┌───▼─────────────────┐   ┌──────────────▼──────┐
│  API ROUTES (/api)  │   │  PAGES (/app)      │
│                     │   │                    │
│ - Auth              │   │ - Home, About      │
│ - Articles          │   │ - Profile          │
│ - Forums            │   │ - Writings         │
│ - Comments          │   │ - Forums           │
│ - Admin             │   │ - Gallery          │
│ - Upload            │   │ - Dashboard        │
│ - Search            │   │ - Admin Panel      │
└──────┬──────────────┘   └────────────────────┘
       │
       │ (ORM)
┌──────▼──────────────────────┐
│  PRISMA CLIENT              │
│  (Database Abstraction)     │
└──────┬──────────────────────┘
       │
       │ (SQL)
┌──────▼──────────────────────┐
│  POSTGRESQL DATABASE        │
│                             │
│ Users, Articles, Forums,    │
│ Comments, Categories, etc   │
└─────────────────────────────┘
       │
       │ (Optional)
┌──────▼──────────────────────┐
│  EXTERNAL SERVICES          │
│                             │
│ - Resend API (Email)        │
│ - File Storage (public/)    │
└─────────────────────────────┘
```

---

## 📝 RINGKASAN

**Disada** adalah platform komunitas digital yang lengkap dengan fitur:
- ✅ Full authentication system
- ✅ Article publishing dengan visibility control
- ✅ Forum diskusi dengan nested comments
- ✅ User profiles & portfolios
- ✅ Gallery management
- ✅ Event tracking
- ✅ Admin dashboard
- ✅ Search & filtering

Dibangun dengan **Next.js** (modern React), **Prisma** (type-safe ORM), dan **PostgreSQL** (robust database).

Semua fitur terintegrasi dengan baik dan siap production-ready dengan security, session management, dan proper error handling.

---

**Dokumentasi ini dibuat: 17 Maret 2026**  
**Untuk pertanyaan lebih lanjut, lihat kode sumber di `src/` folder**
