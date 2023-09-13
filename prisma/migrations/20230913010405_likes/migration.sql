/*
  Warnings:

  - You are about to drop the column `isLiked` on the `Like` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Like" DROP COLUMN "isLiked";

-- CreateTable
CREATE TABLE "_likedBy" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_likedBy_AB_unique" ON "_likedBy"("A", "B");

-- CreateIndex
CREATE INDEX "_likedBy_B_index" ON "_likedBy"("B");

-- AddForeignKey
ALTER TABLE "_likedBy" ADD CONSTRAINT "_likedBy_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likedBy" ADD CONSTRAINT "_likedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
