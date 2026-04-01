-- Ensure ProgramCategory table exists to match Prisma schema
CREATE TABLE IF NOT EXISTS "ProgramCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "color" TEXT NOT NULL DEFAULT '#6366f1',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProgramCategory_pkey" PRIMARY KEY ("id")
);

-- Unique constraints for ProgramCategory
CREATE UNIQUE INDEX IF NOT EXISTS "ProgramCategory_name_key" ON "ProgramCategory"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "ProgramCategory_slug_key" ON "ProgramCategory"("slug");

-- Add missing categoryId column on Program and relation to ProgramCategory
ALTER TABLE "Program"
  ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Program_categoryId_fkey'
  ) THEN
    ALTER TABLE "Program"
      ADD CONSTRAINT "Program_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "ProgramCategory"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;

-- Align GalleryCategory with Prisma schema (slug + color + unique on slug)
ALTER TABLE "GalleryCategory"
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "color" TEXT DEFAULT '#6366f1';

CREATE UNIQUE INDEX IF NOT EXISTS "GalleryCategory_slug_key" ON "GalleryCategory"("slug");

