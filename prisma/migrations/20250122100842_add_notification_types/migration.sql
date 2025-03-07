/*
  Warnings:

  - Changed the type of `type` on the `notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationTypes" AS ENUM ('GATHERING_INVITATION_RECEIVED', 'GATHERING_INVITATION_ACCEPTED', 'GROUP_INVITATION', 'FRIEND_REQUEST', 'FRIEND_REQUEST_ACCEPTED', 'FEED_COMMENT');

-- AlterTable
ALTER TABLE "notification" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationTypes" NOT NULL;
