-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "socketIds" SET NOT NULL,
ALTER COLUMN "socketIds" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "usersId" TEXT NOT NULL,
    "socketId" TEXT NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);
