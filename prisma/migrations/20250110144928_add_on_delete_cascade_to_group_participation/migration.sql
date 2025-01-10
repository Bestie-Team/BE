-- DropForeignKey
ALTER TABLE "group_participation" DROP CONSTRAINT "group_participation_group_id_fkey";

-- DropForeignKey
ALTER TABLE "group_participation" DROP CONSTRAINT "group_participation_participant_id_fkey";

-- AddForeignKey
ALTER TABLE "group_participation" ADD CONSTRAINT "group_participation_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_participation" ADD CONSTRAINT "group_participation_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
