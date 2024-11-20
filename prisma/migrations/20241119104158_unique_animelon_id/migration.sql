/*
  Warnings:

  - A unique constraint covering the columns `[animelonVideoId]` on the table `Video` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Video_animelonVideoId_key" ON "Video"("animelonVideoId");
