/*
  Warnings:

  - Added the required column `index` to the `feed_image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "feed_image" ADD COLUMN     "index" INTEGER NOT NULL;
