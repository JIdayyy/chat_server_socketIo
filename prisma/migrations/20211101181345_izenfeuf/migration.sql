/*
  Warnings:

  - You are about to drop the column `socketIds` on the `Room` table. All the data in the column will be lost.
  - Added the required column `socketId` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "socketIds",
ADD COLUMN     "socketId" TEXT NOT NULL,
ADD COLUMN     "user" TEXT NOT NULL;
