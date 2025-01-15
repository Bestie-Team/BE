-- DropForeignKey
ALTER TABLE "feed" DROP CONSTRAINT "feed_gathering_id_fkey";

-- AlterTable
ALTER TABLE "feed" ALTER COLUMN "gathering_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "feed" ADD CONSTRAINT "feed_gathering_id_fkey" FOREIGN KEY ("gathering_id") REFERENCES "gathering"("id") ON DELETE SET NULL ON UPDATE CASCADE;
