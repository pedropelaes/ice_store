/*
  Warnings:

  - The `active` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'PENDING', 'DEACTIVATED');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "active",
ADD COLUMN     "active" "ProductStatus" NOT NULL DEFAULT 'PENDING';
