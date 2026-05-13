-- CreateTable
CREATE TABLE "Members" (
    "id" SERIAL NOT NULL,
    "position" TEXT NOT NULL,
    "name" TEXT,
    "education" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "parlament" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "Members_pkey" PRIMARY KEY ("id")
);
