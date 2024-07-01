-- CreateTable
CREATE TABLE "Like" (
    "id" SERIAL NOT NULL,
    "commentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_commentId_userId_key" ON "Like"("commentId", "userId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
