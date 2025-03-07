-- AlterTable
ALTER TABLE "gathering" ADD COLUMN     "group_id" TEXT;

-- AddForeignKey
ALTER TABLE "gathering" ADD CONSTRAINT "gathering_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
