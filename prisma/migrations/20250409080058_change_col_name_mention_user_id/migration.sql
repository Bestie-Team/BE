/*
  Warnings:

  - You are about to drop the column `mention_user_id` on the `feed_comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "feed_comment" DROP COLUMN "mention_user_id",
ADD COLUMN     "mentioned_user_id" UUID;
