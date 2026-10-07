-- Turns the flat MenuPage list into a tree: groups (dropdowns) that hold other
-- entries. Safe to re-run, and safe on rows created before this change.

-- Groups have no page of their own, so they have no slug.
ALTER TABLE "MenuPage" ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MenuPage" ADD COLUMN IF NOT EXISTS "kind" TEXT NOT NULL DEFAULT 'page';
ALTER TABLE "MenuPage" ADD COLUMN IF NOT EXISTS "parentId" INTEGER;

-- AddForeignKey (a group that still has entries inside cannot be deleted)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MenuPage_parentId_fkey') THEN
    ALTER TABLE "MenuPage"
      ADD CONSTRAINT "MenuPage_parentId_fkey"
      FOREIGN KEY ("parentId") REFERENCES "MenuPage"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
