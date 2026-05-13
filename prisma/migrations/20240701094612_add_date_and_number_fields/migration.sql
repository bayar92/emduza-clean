/*
  Warnings:

  - Added the required column `Date` to the `StCommittee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day` to the `StCommittee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `StCommittee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `StCommittee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StCommittee" ADD COLUMN     "Date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "day" INTEGER NOT NULL,
ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "number" INTEGER NOT NULL;
