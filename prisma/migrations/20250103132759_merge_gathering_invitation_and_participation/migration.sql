/*
  Warnings:

  - You are about to drop the `gathering_invitation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `status` to the `gathering_participation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `gathering_participation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GatheringParticipationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "gathering_invitation" DROP CONSTRAINT "gathering_invitation_gathering_id_fkey";

-- DropForeignKey
ALTER TABLE "gathering_invitation" DROP CONSTRAINT "gathering_invitation_invitee_id_fkey";

-- DropForeignKey
ALTER TABLE "gathering_invitation" DROP CONSTRAINT "gathering_invitation_inviter_id_fkey";

-- AlterTable
ALTER TABLE "gathering_participation" ADD COLUMN     "status" "GatheringParticipationStatus" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "gathering_invitation";
