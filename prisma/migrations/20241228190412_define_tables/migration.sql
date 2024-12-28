-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE', 'KAKAO', 'APPLE');

-- CreateEnum
CREATE TYPE "FriendStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REMOVED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "name" VARCHAR(10) NOT NULL,
    "service_id" VARCHAR(15) NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gathering" (
    "id" TEXT NOT NULL,
    "host_user_id" TEXT NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "description" VARCHAR(40) NOT NULL,
    "gathering_date" TIMESTAMP(3) NOT NULL,
    "address" VARCHAR(100) NOT NULL,
    "invitation_image_url" TEXT NOT NULL,
    "is_done" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "gathering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gathering_invitation" (
    "id" TEXT NOT NULL,
    "gathering_id" TEXT NOT NULL,
    "inviter_id" TEXT NOT NULL,
    "invitee_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "gathering_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gathering_participation" (
    "id" TEXT NOT NULL,
    "gathering_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "gathering_participation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed" (
    "id" TEXT NOT NULL,
    "writer_id" TEXT NOT NULL,
    "content" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "feed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_image" (
    "id" TEXT NOT NULL,
    "feed_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "feed_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_comment" (
    "id" TEXT NOT NULL,
    "feed_id" TEXT NOT NULL,
    "writer_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "feed_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "FriendStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "description" VARCHAR(40) NOT NULL,
    "group_image_url" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_participation" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "group_participation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_service_id_key" ON "user"("service_id");

-- AddForeignKey
ALTER TABLE "gathering" ADD CONSTRAINT "gathering_host_user_id_fkey" FOREIGN KEY ("host_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gathering_invitation" ADD CONSTRAINT "gathering_invitation_gathering_id_fkey" FOREIGN KEY ("gathering_id") REFERENCES "gathering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gathering_invitation" ADD CONSTRAINT "gathering_invitation_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gathering_invitation" ADD CONSTRAINT "gathering_invitation_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gathering_participation" ADD CONSTRAINT "gathering_participation_gathering_id_fkey" FOREIGN KEY ("gathering_id") REFERENCES "gathering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gathering_participation" ADD CONSTRAINT "gathering_participation_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed" ADD CONSTRAINT "feed_writer_id_fkey" FOREIGN KEY ("writer_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_image" ADD CONSTRAINT "feed_image_feed_id_fkey" FOREIGN KEY ("feed_id") REFERENCES "feed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_comment" ADD CONSTRAINT "feed_comment_feed_id_fkey" FOREIGN KEY ("feed_id") REFERENCES "feed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_comment" ADD CONSTRAINT "feed_comment_writer_id_fkey" FOREIGN KEY ("writer_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_participation" ADD CONSTRAINT "group_participation_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_participation" ADD CONSTRAINT "group_participation_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
