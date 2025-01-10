/*
  Warnings:

  - Added the required column `type` to the `gathering` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GatheringType" AS ENUM ('FRIEND', 'GROUP');

-- AlterTable
ALTER TABLE "gathering" ADD COLUMN     "type" "GatheringType" NOT NULL;
