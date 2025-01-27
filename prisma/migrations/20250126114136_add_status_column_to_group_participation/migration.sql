-- CreateEnum
CREATE TYPE "GroupParticipationStatus" AS ENUM ('ACCEPTED', 'REPORTED');

-- AlterTable
ALTER TABLE "group_participation" ADD COLUMN     "status" "GroupParticipationStatus" NOT NULL DEFAULT 'ACCEPTED';
