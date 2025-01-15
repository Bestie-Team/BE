/*
  Warnings:

  - You are about to drop the column `is_done` on the `gathering` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "gathering" DROP COLUMN "is_done",
ADD COLUMN     "ended_at" TIMESTAMP(3);
