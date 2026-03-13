-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "articleId" TEXT,
ALTER COLUMN "forumId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
