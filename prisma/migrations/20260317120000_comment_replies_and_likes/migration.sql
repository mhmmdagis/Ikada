-- Add comment replies (parentId) + likes on comments (commentId in Like)

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "parentId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Comment_parentId_idx" ON "Comment"("parentId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "Comment"
    ADD CONSTRAINT "Comment_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "Like" ADD COLUMN IF NOT EXISTS "commentId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Like_commentId_idx" ON "Like"("commentId");

-- CreateIndex (Prisma @@unique([userId, commentId]))
CREATE UNIQUE INDEX IF NOT EXISTS "Like_userId_commentId_key" ON "Like"("userId", "commentId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "Like"
    ADD CONSTRAINT "Like_commentId_fkey"
    FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

