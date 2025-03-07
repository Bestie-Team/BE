-- CreateTable
CREATE TABLE "refresh_token" (
    "user_id" UUID NOT NULL,
    "device_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("user_id","device_id")
);
