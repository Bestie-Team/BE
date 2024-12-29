/*
  Warnings:

  - You are about to drop the column `receiverId` on the `friend` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `friend` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `friend` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[friend1Id,friend2Id]` on the table `friend` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `friend1Id` to the `friend` table without a default value. This is not possible if the table is not empty.
  - Added the required column `friend2Id` to the `friend` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "friend" DROP CONSTRAINT "friend_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "friend" DROP CONSTRAINT "friend_senderId_fkey";

-- DropIndex
DROP INDEX "friend_senderId_receiverId_key";

-- AlterTable
ALTER TABLE "friend" DROP COLUMN "receiverId",
DROP COLUMN "senderId",
DROP COLUMN "status",
ADD COLUMN     "friend1Id" TEXT NOT NULL,
ADD COLUMN     "friend2Id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "gathering" ALTER COLUMN "is_done" SET DEFAULT false;

-- CreateTable
CREATE TABLE "friend_request" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friend_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "friend_request_sender_id_receiver_id_key" ON "friend_request"("sender_id", "receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "friend_friend1Id_friend2Id_key" ON "friend"("friend1Id", "friend2Id");

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_friend1Id_fkey" FOREIGN KEY ("friend1Id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_friend2Id_fkey" FOREIGN KEY ("friend2Id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_request" ADD CONSTRAINT "friend_request_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_request" ADD CONSTRAINT "friend_request_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
