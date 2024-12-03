/*
  Warnings:

  - You are about to drop the column `animelonVideoId` on the `Video` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "wordId" TEXT
);
INSERT INTO "new_Video" ("createdAt", "id", "updatedAt", "url") SELECT "createdAt", "id", "updatedAt", "url" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
CREATE UNIQUE INDEX "Video_id_key" ON "Video"("id");
CREATE UNIQUE INDEX "Video_wordId_key" ON "Video"("wordId");
CREATE TABLE "new_Word" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kanji" TEXT NOT NULL,
    "kana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "sentenceTranslation" TEXT NOT NULL,
    "videoStart" INTEGER NOT NULL,
    "videoEnd" INTEGER NOT NULL,
    "hint" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "videoId" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Word_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Word_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Word" ("createdAt", "hint", "id", "kana", "kanji", "romaji", "sentence", "sentenceTranslation", "translation", "updatedAt", "userId", "videoEnd", "videoId", "videoStart") SELECT "createdAt", "hint", "id", "kana", "kanji", "romaji", "sentence", "sentenceTranslation", "translation", "updatedAt", "userId", "videoEnd", "videoId", "videoStart" FROM "Word";
DROP TABLE "Word";
ALTER TABLE "new_Word" RENAME TO "Word";
CREATE UNIQUE INDEX "Word_id_key" ON "Word"("id");
CREATE UNIQUE INDEX "Word_videoId_key" ON "Word"("videoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
