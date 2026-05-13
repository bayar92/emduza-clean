/*
  Warnings:

  - Made the column `slug` on table `News` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "News" ALTER COLUMN "slug" SET NOT NULL;
