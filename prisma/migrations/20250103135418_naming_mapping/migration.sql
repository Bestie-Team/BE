/*
  Warnings:

  - You are about to drop the column `receiverId` on the `friend` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `friend` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sender_id,receiver_id]` on the table `friend` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiver_id` to the `friend` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `friend` table without a default value. This is not possible if the table is not empty.

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
ADD COLUMN     "receiver_id" TEXT NOT NULL,
ADD COLUMN     "sender_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "friend_sender_id_receiver_id_key" ON "friend"("sender_id", "receiver_id");

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
