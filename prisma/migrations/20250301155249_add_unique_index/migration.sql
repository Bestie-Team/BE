-- CreateIndex
CREATE UNIQUE INDEX "blocked_feed_user_id_feed_id_key" ON "blocked_feed"("user_id", "feed_id");

-- CreateIndex
CREATE UNIQUE INDEX "friend_sender_id_receiver_id_key" ON "friend"("sender_id", "receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_participation_group_id_participant_id_key" ON "group_participation"("group_id", "participant_id");
