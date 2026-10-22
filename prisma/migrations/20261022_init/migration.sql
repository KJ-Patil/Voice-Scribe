-- CreateTable
CREATE TABLE "transcriptions" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "language" VARCHAR(50) NOT NULL DEFAULT 'Auto-detect',
    "duration_s" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transcriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transcriptions_created_at_idx" ON "transcriptions"("created_at" DESC);

-- CreateIndex
CREATE INDEX "transcriptions_language_idx" ON "transcriptions"("language");
