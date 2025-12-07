-- CreateTable
CREATE TABLE "UserKnowledge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserKnowledge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserKnowledge_userId_idx" ON "UserKnowledge"("userId");

-- AddForeignKey
ALTER TABLE "UserKnowledge" ADD CONSTRAINT "UserKnowledge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
