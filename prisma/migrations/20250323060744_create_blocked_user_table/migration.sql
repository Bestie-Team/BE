-- CreateTable
CREATE TABLE "blocked_user" (
    "blocker_id" UUID NOT NULL,
    "blocked_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocked_user_pkey" PRIMARY KEY ("blocker_id","blocked_id")
);

-- CreateIndex
CREATE INDEX "blocked_user_blocked_id_idx" ON "blocked_user"("blocked_id");
