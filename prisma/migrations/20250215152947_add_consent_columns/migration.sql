/*
  Warnings:

  - Added the required column `privacy_policy_consent` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `terms_of_service_consent` to the `user` table without a default value. This is not possible if the table is not empty.

*/
ALTER TABLE "user"
ADD COLUMN "notification_token" TEXT,
ADD COLUMN "marketing_notification_consent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "service_notification_consent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "privacy_policy_consent" BOOLEAN,
ADD COLUMN "terms_of_service_consent" BOOLEAN;

-- NULL 값을 가진 기존 데이터 업데이트
UPDATE "user" 
SET privacy_policy_consent = TRUE,
    terms_of_service_consent = TRUE
WHERE privacy_policy_consent IS NULL OR terms_of_service_consent IS NULL;

-- NOT NULL 제약 조건 추가
ALTER TABLE "user"
ALTER COLUMN privacy_policy_consent SET NOT NULL,
ALTER COLUMN terms_of_service_consent SET NOT NULL;

