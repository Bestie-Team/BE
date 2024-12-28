/*
  Warnings:

  - The values [REMOVED] on the enum `FriendStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `deleted_at` on the `friend` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `group` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[senderId,receiverId]` on the table `friend` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[group_id,participant_id]` on the table `group_participation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,deleted_at]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[service_id,deleted_at]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FriendStatus_new" AS ENUM ('PENDING', 'ACCEPTED');
ALTER TABLE "friend" ALTER COLUMN "status" TYPE "FriendStatus_new" USING ("status"::text::"FriendStatus_new");
ALTER TYPE "FriendStatus" RENAME TO "FriendStatus_old";
ALTER TYPE "FriendStatus_new" RENAME TO "FriendStatus";
DROP TYPE "FriendStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "friend" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "group" DROP COLUMN "deleted_at";

-- CreateTable
CREATE TABLE "BlockedFeed" (
    "id" TEXT NOT NULL,

    CONSTRAINT "BlockedFeed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "friend_senderId_receiverId_key" ON "friend"("senderId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "group_participation_group_id_participant_id_key" ON "group_participation"("group_id", "participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_deleted_at_key" ON "user"("email", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_service_id_deleted_at_key" ON "user"("service_id", "deleted_at");
