/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `feed_image` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `gathering_participation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "feed_image" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "gathering_participation" DROP COLUMN "deleted_at";
