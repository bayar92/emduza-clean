/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `News` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "News" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");
