-- CreateTable
CREATE TABLE "AaIntroduction" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AaIntroduction_pkey" PRIMARY KEY ("id")
);
