-- CreateTable
CREATE TABLE "Mend" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "company" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "Mend_pkey" PRIMARY KEY ("id")
);
