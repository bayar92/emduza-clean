-- CreateTable
CREATE TABLE "Stcommittee" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "filename" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stcommittee_pkey" PRIMARY KEY ("id")
);
