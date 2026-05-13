-- CreateTable
CREATE TABLE "TechMember" (
    "id" SERIAL NOT NULL,
    "position" TEXT NOT NULL,
    "name" TEXT,
    "education" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "research" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "TechMember_pkey" PRIMARY KEY ("id")
);
