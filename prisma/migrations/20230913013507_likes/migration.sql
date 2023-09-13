/*
  Warnings:

  - You are about to drop the `_likedBy` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `isLiked` to the `Like` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_likedBy" DROP CONSTRAINT "_likedBy_A_fkey";

-- DropForeignKey
ALTER TABLE "_likedBy" DROP CONSTRAINT "_likedBy_B_fkey";

-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "isLiked" BOOLEAN NOT NULL;

-- DropTable
DROP TABLE "_likedBy";
