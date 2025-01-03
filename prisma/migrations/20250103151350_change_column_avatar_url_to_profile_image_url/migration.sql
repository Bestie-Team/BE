/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `user` table. All the data in the column will be lost.
  - Added the required column `profile_image_url` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "avatar_url",
ADD COLUMN     "profile_image_url" TEXT NOT NULL;
