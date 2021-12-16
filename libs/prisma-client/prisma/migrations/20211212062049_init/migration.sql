/*
  Warnings:

  - You are about to drop the `_allChats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_allChats" DROP CONSTRAINT "_allChats_A_fkey";

-- DropForeignKey
ALTER TABLE "_allChats" DROP CONSTRAINT "_allChats_B_fkey";

-- DropTable
DROP TABLE "_allChats";

-- CreateTable
CREATE TABLE "_chats" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_chats_AB_unique" ON "_chats"("A", "B");

-- CreateIndex
CREATE INDEX "_chats_B_index" ON "_chats"("B");

-- AddForeignKey
ALTER TABLE "_chats" ADD FOREIGN KEY ("A") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_chats" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
