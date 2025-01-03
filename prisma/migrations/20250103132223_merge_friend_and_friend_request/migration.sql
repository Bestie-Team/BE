/*
  Warnings:

  - You are about to drop the column `friend1Id` on the `friend` table. All the data in the column will be lost.
  - You are about to drop the column `friend2Id` on the `friend` table. All the data in the column will be lost.
  - You are about to drop the `friend_request` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[senderId,receiverId]` on the table `friend` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiverId` to the `friend` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `friend` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `friend` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_ap` to the `friend` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FriendStatus" ADD VALUE 'REJECTED';
ALTER TYPE "FriendStatus" ADD VALUE 'REPORTED';

-- DropForeignKey
ALTER TABLE "friend" DROP CONSTRAINT "friend_friend1Id_fkey";

-- DropForeignKey
ALTER TABLE "friend" DROP CONSTRAINT "friend_friend2Id_fkey";

-- DropForeignKey
ALTER TABLE "friend_request" DROP CONSTRAINT "friend_request_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "friend_request" DROP CONSTRAINT "friend_request_sender_id_fkey";

-- DropIndex
DROP INDEX "friend_friend1Id_friend2Id_key";

-- AlterTable
ALTER TABLE "friend" DROP COLUMN "friend1Id",
DROP COLUMN "friend2Id",
ADD COLUMN     "receiverId" TEXT NOT NULL,
ADD COLUMN     "senderId" TEXT NOT NULL,
ADD COLUMN     "status" "FriendStatus" NOT NULL,
ADD COLUMN     "updated_ap" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "friend_request";

-- CreateIndex
CREATE UNIQUE INDEX "friend_senderId_receiverId_key" ON "friend"("senderId", "receiverId");

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
