-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FILER', 'CLIENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessDocument" (
    "id" SERIAL NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "email" TEXT,
    "companyType" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "ein" TEXT,
    "dateFiled" TIMESTAMP(3) NOT NULL,
    "state" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "principalAddress" TEXT NOT NULL,
    "registeredAgentName" TEXT NOT NULL,
    "firstOfficerName" TEXT,
    "firstOfficerTitle" TEXT,
    "secondOfficerName" TEXT,
    "secondOfficerTitle" TEXT,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiledEntity" (
    "id" SERIAL NOT NULL,
    "businessName" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inCompliance" BOOLEAN NOT NULL DEFAULT false,
    "lastFiled" TIMESTAMP(3),

    CONSTRAINT "FiledEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filing" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "stripeSessionId" TEXT,
    "sunbizReceiptUrl" TEXT,
    "payloadSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "errorMessage" TEXT,

    CONSTRAINT "Filing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL,
    "filingId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessDocument_documentNumber_key" ON "BusinessDocument"("documentNumber");

-- CreateIndex
CREATE INDEX "BusinessDocument_companyName_idx" ON "BusinessDocument"("companyName");

-- CreateIndex
CREATE INDEX "BusinessDocument_ein_idx" ON "BusinessDocument"("ein");

-- CreateIndex
CREATE INDEX "BusinessDocument_registeredAgentName_idx" ON "BusinessDocument"("registeredAgentName");

-- CreateIndex
CREATE INDEX "BusinessDocument_firstOfficerName_idx" ON "BusinessDocument"("firstOfficerName");

-- CreateIndex
CREATE INDEX "BusinessDocument_firstOfficerTitle_idx" ON "BusinessDocument"("firstOfficerTitle");

-- CreateIndex
CREATE INDEX "FiledEntity_userId_idx" ON "FiledEntity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FiledEntity_userId_documentNumber_key" ON "FiledEntity"("userId", "documentNumber");

-- CreateIndex
CREATE INDEX "Filing_businessId_idx" ON "Filing"("businessId");

-- CreateIndex
CREATE INDEX "Filing_userId_idx" ON "Filing"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_email_token_key" ON "PasswordResetToken"("email", "token");

-- AddForeignKey
ALTER TABLE "FiledEntity" ADD CONSTRAINT "FiledEntity_documentNumber_fkey" FOREIGN KEY ("documentNumber") REFERENCES "BusinessDocument"("documentNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiledEntity" ADD CONSTRAINT "FiledEntity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filing" ADD CONSTRAINT "Filing_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "FiledEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filing" ADD CONSTRAINT "Filing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "Filing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
