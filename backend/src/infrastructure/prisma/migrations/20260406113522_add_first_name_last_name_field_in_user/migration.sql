/*
  Warnings:

  - You are about to drop the column `first_name` on the `traders` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `traders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "traders" DROP COLUMN "first_name",
DROP COLUMN "last_name";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT;
