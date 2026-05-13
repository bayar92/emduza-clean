/*
  Warnings:

  - Added the required column `updatedAt` to the `Goal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "filename" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
