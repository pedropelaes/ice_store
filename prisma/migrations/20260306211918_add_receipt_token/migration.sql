/*
  Warnings:

  - A unique constraint covering the columns `[receipt_token]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "receipt_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_receipt_token_key" ON "Order"("receipt_token");
