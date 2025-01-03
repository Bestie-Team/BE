/*
  Warnings:

  - Added the required column `gathering_id` to the `feed` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "feed" ADD COLUMN     "gathering_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "feed" ADD CONSTRAINT "feed_gathering_id_fkey" FOREIGN KEY ("gathering_id") REFERENCES "gathering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
