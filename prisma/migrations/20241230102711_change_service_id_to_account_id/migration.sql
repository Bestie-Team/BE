/*
  Warnings:

  - You are about to drop the column `service_id` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[account_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[account_id,deleted_at]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_service_id_deleted_at_key";

-- DropIndex
DROP INDEX "user_service_id_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "service_id",
ADD COLUMN     "account_id" VARCHAR(15) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_account_id_key" ON "user"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_id_deleted_at_key" ON "user"("account_id", "deleted_at");
