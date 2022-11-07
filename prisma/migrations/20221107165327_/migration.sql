-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "role" VARCHAR(10) NOT NULL,
    "firstName" VARCHAR(30) NOT NULL,
    "lastName" VARCHAR(30),
    "phoneNumber" VARCHAR(10),
    "email" VARCHAR(30) NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "passwordHash" TEXT NOT NULL,
    "refreshTokenHash" TEXT,
    "profilePictureName" TEXT,
    "standardMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "id" SERIAL NOT NULL,
    "role" VARCHAR(10) NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" VARCHAR(15) NOT NULL,
    "street" VARCHAR(30) NOT NULL,
    "postCode" VARCHAR(5) NOT NULL,
    "city" VARCHAR(30) NOT NULL,
    "gpsLatitude" DECIMAL(8,6),
    "gpsLongitude" DECIMAL(9,6),
    "description" TEXT,
    "surface" INTEGER NOT NULL,
    "room" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isDateFlexible" INTEGER NOT NULL,
    "pricePerMonth" INTEGER NOT NULL,
    "isPublished" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease_img" (
    "id" SERIAL NOT NULL,
    "leaseId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_img_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease_type" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(15) NOT NULL,

    CONSTRAINT "lease_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease_message" (
    "id" SERIAL NOT NULL,
    "leaseId" INTEGER NOT NULL,
    "fromUserId" INTEGER NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lease_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease_favorite" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "leaseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lease_favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset" (
    "id" SERIAL NOT NULL,
    "userEmail" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_role_key" ON "user_role"("role");

-- CreateIndex
CREATE UNIQUE INDEX "lease_type_type_key" ON "lease_type"("type");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_fkey" FOREIGN KEY ("role") REFERENCES "user_role"("role") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lease" ADD CONSTRAINT "lease_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease" ADD CONSTRAINT "lease_type_fkey" FOREIGN KEY ("type") REFERENCES "lease_type"("type") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lease_img" ADD CONSTRAINT "lease_img_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "lease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_message" ADD CONSTRAINT "lease_message_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "lease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_message" ADD CONSTRAINT "lease_message_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_favorite" ADD CONSTRAINT "lease_favorite_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "lease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_favorite" ADD CONSTRAINT "lease_favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification" ADD CONSTRAINT "email_verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset" ADD CONSTRAINT "password_reset_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "user"("email") ON DELETE CASCADE ON UPDATE CASCADE;
