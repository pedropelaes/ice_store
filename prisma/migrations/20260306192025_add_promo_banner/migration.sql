-- CreateTable
CREATE TABLE "PromoBanner" (
    "id" SERIAL NOT NULL,
    "image_url" TEXT NOT NULL,
    "route" TEXT NOT NULL,

    CONSTRAINT "PromoBanner_pkey" PRIMARY KEY ("id")
);
