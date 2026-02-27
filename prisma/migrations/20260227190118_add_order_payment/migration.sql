/*
  Warnings:

  - You are about to drop the `CheckoutSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "IPaymentMethod" AS ENUM ('PIX', 'CREDIT');

-- DropForeignKey
ALTER TABLE "CheckoutSession" DROP CONSTRAINT "CheckoutSession_user_id_fkey";

-- DropTable
DROP TABLE "CheckoutSession";

-- DropEnum
DROP TYPE "SessionStatus";

-- CreateTable
CREATE TABLE "OrderPayment" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "method" "IPaymentMethod" NOT NULL,
    "installments" INTEGER NOT NULL DEFAULT 1,
    "card_brand" TEXT,
    "card_last4" TEXT,

    CONSTRAINT "OrderPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderPayment_orderId_key" ON "OrderPayment"("orderId");

-- AddForeignKey
ALTER TABLE "OrderPayment" ADD CONSTRAINT "OrderPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
