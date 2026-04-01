-- Add missing profile columns used by schema + seed
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "major" TEXT,
  ADD COLUMN IF NOT EXISTS "batch" TEXT;

