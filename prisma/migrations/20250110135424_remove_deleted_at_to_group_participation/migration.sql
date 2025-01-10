/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `group_participation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "group_participation" DROP COLUMN "deleted_at";
