DROP VIEW IF EXISTS "active_user";
DROP VIEW IF EXISTS "active_feed";
DROP VIEW IF EXISTS "active_feed_comment";
DROP VIEW IF EXISTS "active_gathering";

-- DropForeignKey
ALTER TABLE "blocked_feed" DROP CONSTRAINT "blocked_feed_feed_id_fkey";

-- DropForeignKey
ALTER TABLE "blocked_feed" DROP CONSTRAINT "blocked_feed_user_id_fkey";

-- DropForeignKey
ALTER TABLE "feed" DROP CONSTRAINT "feed_gathering_id_fkey";

-- DropForeignKey
ALTER TABLE "feed" DROP CONSTRAINT "feed_writer_id_fkey";

-- DropForeignKey
ALTER TABLE "feed_comment" DROP CONSTRAINT "feed_comment_feed_id_fkey";

-- DropForeignKey
ALTER TABLE "feed_comment" DROP CONSTRAINT "feed_comment_writer_id_fkey";

-- DropForeignKey
ALTER TABLE "feed_image" DROP CONSTRAINT "feed_image_feed_id_fkey";

-- DropForeignKey
ALTER TABLE "friend" DROP CONSTRAINT "friend_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "friend" DROP CONSTRAINT "friend_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "friend_feed_visibility" DROP CONSTRAINT "friend_feed_visibility_feed_id_fkey";

-- DropForeignKey
ALTER TABLE "friend_feed_visibility" DROP CONSTRAINT "friend_feed_visibility_user_id_fkey";

-- DropForeignKey
ALTER TABLE "gathering" DROP CONSTRAINT "gathering_group_id_fkey";

-- DropForeignKey
ALTER TABLE "gathering" DROP CONSTRAINT "gathering_host_user_id_fkey";

-- DropForeignKey
ALTER TABLE "gathering_participation" DROP CONSTRAINT "gathering_participation_gathering_id_fkey";

-- DropForeignKey
ALTER TABLE "gathering_participation" DROP CONSTRAINT "gathering_participation_participant_id_fkey";

-- DropForeignKey
ALTER TABLE "group" DROP CONSTRAINT "group_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "group_participation" DROP CONSTRAINT "group_participation_group_id_fkey";

-- DropForeignKey
ALTER TABLE "group_participation" DROP CONSTRAINT "group_participation_participant_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_reporter_id_fkey";

-- AlterTable
ALTER TABLE "blocked_feed" DROP COLUMN "feed_id",
ADD COLUMN     "feed_id" UUID NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "feed" DROP CONSTRAINT "feed_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "writer_id",
ADD COLUMN     "writer_id" UUID NOT NULL,
DROP COLUMN "gathering_id",
ADD COLUMN     "gathering_id" UUID,
ADD CONSTRAINT "feed_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "feed_comment" DROP CONSTRAINT "feed_comment_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "feed_id",
ADD COLUMN     "feed_id" UUID NOT NULL,
DROP COLUMN "writer_id",
ADD COLUMN     "writer_id" UUID NOT NULL,
ADD CONSTRAINT "feed_comment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "feed_image" DROP CONSTRAINT "feed_image_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "feed_id",
ADD COLUMN     "feed_id" UUID NOT NULL,
ADD CONSTRAINT "feed_image_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "friend" DROP CONSTRAINT "friend_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "receiver_id",
ADD COLUMN     "receiver_id" UUID NOT NULL,
DROP COLUMN "sender_id",
ADD COLUMN     "sender_id" UUID NOT NULL,
ADD CONSTRAINT "friend_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "friend_feed_visibility" DROP CONSTRAINT "friend_feed_visibility_pkey",
DROP COLUMN "feed_id",
ADD COLUMN     "feed_id" UUID NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "friend_feed_visibility_pkey" PRIMARY KEY ("feed_id", "user_id");

-- AlterTable
ALTER TABLE "gathering" DROP CONSTRAINT "gathering_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "host_user_id",
ADD COLUMN     "host_user_id" UUID NOT NULL,
DROP COLUMN "group_id",
ADD COLUMN     "group_id" UUID,
ADD CONSTRAINT "gathering_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "gathering_participation" DROP CONSTRAINT "gathering_participation_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "gathering_id",
ADD COLUMN     "gathering_id" UUID NOT NULL,
DROP COLUMN "participant_id",
ADD COLUMN     "participant_id" UUID NOT NULL,
ADD CONSTRAINT "gathering_participation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "group" DROP CONSTRAINT "group_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "owner_id",
ADD COLUMN     "owner_id" UUID NOT NULL,
ADD CONSTRAINT "group_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "group_participation" DROP CONSTRAINT "group_participation_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "group_id",
ADD COLUMN     "group_id" UUID NOT NULL,
DROP COLUMN "participant_id",
ADD COLUMN     "participant_id" UUID NOT NULL,
ADD CONSTRAINT "group_participation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "notification" DROP CONSTRAINT "notification_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "notification_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "report" DROP CONSTRAINT "report_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "reporter_id",
ADD COLUMN     "reporter_id" UUID NOT NULL,
DROP COLUMN "reported_id",
ADD COLUMN     "reported_id" UUID NOT NULL,
ADD CONSTRAINT "report_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");
