/*
  Warnings:

  - The primary key for the `Friends` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Friends` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Friends_pkey" PRIMARY KEY ("senderId", "receiverId");
