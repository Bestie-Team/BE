-- CreateIndex
CREATE INDEX "blocked_feed_feed_id_idx" ON "blocked_feed"("feed_id");

-- CreateIndex
CREATE INDEX "feed_writer_id_idx" ON "feed"("writer_id");

-- CreateIndex
CREATE INDEX "feed_gathering_id_idx" ON "feed"("gathering_id");

-- CreateIndex
CREATE INDEX "feed_comment_feed_id_idx" ON "feed_comment"("feed_id");

-- CreateIndex
CREATE INDEX "feed_comment_writer_id_idx" ON "feed_comment"("writer_id");

-- CreateIndex
CREATE INDEX "feed_image_feed_id_idx" ON "feed_image"("feed_id");

-- CreateIndex
CREATE INDEX "friend_receiver_id_idx" ON "friend"("receiver_id");

-- CreateIndex
CREATE INDEX "friend_feed_visibility_user_id_idx" ON "friend_feed_visibility"("user_id");

-- CreateIndex
CREATE INDEX "gathering_host_user_id_idx" ON "gathering"("host_user_id");

-- CreateIndex
CREATE INDEX "gathering_group_id_idx" ON "gathering"("group_id");

-- CreateIndex
CREATE INDEX "gathering_participation_gathering_id_idx" ON "gathering_participation"("gathering_id");

-- CreateIndex
CREATE INDEX "gathering_participation_participant_id_idx" ON "gathering_participation"("participant_id");

-- CreateIndex
CREATE INDEX "group_owner_id_idx" ON "group"("owner_id");

-- CreateIndex
CREATE INDEX "group_participation_participant_id_idx" ON "group_participation"("participant_id");

-- CreateIndex
CREATE INDEX "notification_user_id_idx" ON "notification"("user_id");

-- CreateIndex
CREATE INDEX "report_reporter_id_idx" ON "report"("reporter_id");
