-- AlterTable
ALTER TABLE "blocked_feed" ADD CONSTRAINT "blocked_feed_pkey" PRIMARY KEY ("user_id", "feed_id");

-- DropIndex
DROP INDEX "blocked_feed_user_id_feed_id_key";

-- AlterTable
ALTER TABLE "blocked_feed_comment" ADD CONSTRAINT "blocked_feed_comment_pkey" PRIMARY KEY ("user_id", "comment_id");

-- DropIndex
DROP INDEX "blocked_feed_comment_user_id_comment_id_key";
