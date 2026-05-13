-- CreateTable
CREATE TABLE "VideoNews" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "videoPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoNews_pkey" PRIMARY KEY ("id")
);
