-- Add missing categoryId column on GalleryItem and relation to GalleryCategory
ALTER TABLE "GalleryItem"
  ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'GalleryItem_categoryId_fkey'
  ) THEN
    ALTER TABLE "GalleryItem"
      ADD CONSTRAINT "GalleryItem_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "GalleryCategory"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;

