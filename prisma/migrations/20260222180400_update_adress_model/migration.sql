/*
  Warnings:

  - Added the required column `phone` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipient_name` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "complement" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "recipient_name" TEXT NOT NULL;
