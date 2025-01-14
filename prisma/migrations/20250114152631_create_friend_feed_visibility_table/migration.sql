-- CreateTable
CREATE TABLE "friend_feed_visibility" (
    "feed_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friend_feed_visibility_pkey" PRIMARY KEY ("feed_id","user_id")
);

-- AddForeignKey
ALTER TABLE "friend_feed_visibility" ADD CONSTRAINT "friend_feed_visibility_feed_id_fkey" FOREIGN KEY ("feed_id") REFERENCES "feed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_feed_visibility" ADD CONSTRAINT "friend_feed_visibility_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
