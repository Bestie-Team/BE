/*
  Warnings:

  - You are about to drop the column `updated_ap` on the `friend` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `friend` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "friend" DROP COLUMN "updated_ap",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
