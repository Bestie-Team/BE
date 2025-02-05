-- DropForeignKey
ALTER TABLE "gathering_participation" DROP CONSTRAINT "gathering_participation_gathering_id_fkey";

-- DropForeignKey
ALTER TABLE "gathering_participation" DROP CONSTRAINT "gathering_participation_participant_id_fkey";

-- AddForeignKey
ALTER TABLE "gathering_participation" ADD CONSTRAINT "gathering_participation_gathering_id_fkey" FOREIGN KEY ("gathering_id") REFERENCES "gathering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gathering_participation" ADD CONSTRAINT "gathering_participation_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
