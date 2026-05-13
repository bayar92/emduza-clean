/*
  Warnings:

  - You are about to drop the `Stcommittee` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Stcommittee";

-- CreateTable
CREATE TABLE "StCommittee" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "filename" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StCommittee_pkey" PRIMARY KEY ("id")
);
