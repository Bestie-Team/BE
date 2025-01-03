/*
  Warnings:

  - Added the required column `updated_at` to the `feed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `feed_comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `gathering` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "feed" ADD COLUMN "updated_at" TIMESTAMP(3) NULL;
ALTER TABLE "feed_comment" ADD COLUMN "updated_at" TIMESTAMP(3) NULL;
ALTER TABLE "gathering" ADD COLUMN "updated_at" TIMESTAMP(3) NULL;
ALTER TABLE "group" ADD COLUMN "updated_at" TIMESTAMP(3) NULL;
ALTER TABLE "user" ADD COLUMN "updated_at" TIMESTAMP(3) NULL;

-- Update
UPDATE "feed" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;
UPDATE "feed_comment" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;
UPDATE "gathering" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;
UPDATE "group" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;
UPDATE "user" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;

-- SetNotNull
ALTER TABLE "feed" ALTER COLUMN "updated_at" SET NOT NULL;
ALTER TABLE "feed_comment" ALTER COLUMN "updated_at" SET NOT NULL;
ALTER TABLE "gathering" ALTER COLUMN "updated_at" SET NOT NULL;
ALTER TABLE "group" ALTER COLUMN "updated_at" SET NOT NULL;
ALTER TABLE "user" ALTER COLUMN "updated_at" SET NOT NULL;