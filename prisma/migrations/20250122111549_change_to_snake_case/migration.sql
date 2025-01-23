/*
  Warnings:

  - You are about to drop the column `feedId` on the `blocked_feed` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `blocked_feed` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,feed_id]` on the table `blocked_feed` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `feed_id` to the `blocked_feed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `blocked_feed` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "blocked_feed" DROP CONSTRAINT "blocked_feed_feedId_fkey";

-- DropForeignKey
ALTER TABLE "blocked_feed" DROP CONSTRAINT "blocked_feed_userId_fkey";

-- DropIndex
DROP INDEX "blocked_feed_userId_feedId_key";

-- AlterTable
ALTER TABLE "blocked_feed" DROP COLUMN "feedId",
DROP COLUMN "userId",
ADD COLUMN     "feed_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "blocked_feed_user_id_feed_id_key" ON "blocked_feed"("user_id", "feed_id");

-- AddForeignKey
ALTER TABLE "blocked_feed" ADD CONSTRAINT "blocked_feed_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_feed" ADD CONSTRAINT "blocked_feed_feed_id_fkey" FOREIGN KEY ("feed_id") REFERENCES "feed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
