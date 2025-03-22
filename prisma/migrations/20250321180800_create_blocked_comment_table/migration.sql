-- CreateTable
CREATE TABLE "blocked_feed_comment" (
    "user_id" UUID NOT NULL,
    "comment_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "blocked_feed_comment_comment_id_idx" ON "blocked_feed_comment"("comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_feed_comment_user_id_comment_id_key" ON "blocked_feed_comment"("user_id", "comment_id");
