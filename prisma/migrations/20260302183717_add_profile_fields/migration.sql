/*
  Warnings:

  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- add new columns nullable initially
ALTER TABLE "User"
  DROP COLUMN "image",
  ADD COLUMN     "avatar" TEXT,
  ADD COLUMN     "instagram" TEXT,
  ADD COLUMN     "linkedin" TEXT,
  ADD COLUMN     "twitter" TEXT,
  ADD COLUMN     "username" TEXT;

-- populate username for existing rows (use email prefix + short id)
UPDATE "User"
SET "username" = CONCAT(split_part("email", '@', 1), '_', substring("id" from 1 for 6))
WHERE "username" IS NULL;

-- force non-null and add unique constraint
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
