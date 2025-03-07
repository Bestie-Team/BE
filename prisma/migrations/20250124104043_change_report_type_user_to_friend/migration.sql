/*
  Warnings:

  - The values [USER] on the enum `ReportTypes` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReportTypes_new" AS ENUM ('FRIEND', 'FEED', 'GROUP');
ALTER TABLE "report" ALTER COLUMN "type" TYPE "ReportTypes_new" USING ("type"::text::"ReportTypes_new");
ALTER TYPE "ReportTypes" RENAME TO "ReportTypes_old";
ALTER TYPE "ReportTypes_new" RENAME TO "ReportTypes";
DROP TYPE "ReportTypes_old";
COMMIT;
