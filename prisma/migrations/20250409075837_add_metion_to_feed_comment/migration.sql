-- AlterEnum
ALTER TYPE "NotificationTypes" ADD VALUE 'FEED_COMMENT_MENTIONED';

-- AlterTable
ALTER TABLE "feed_comment" ADD COLUMN     "mention_user_id" UUID;
