/*
  Warnings:

  - You are about to drop the column `videoUrl` on the `Word` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Word_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Word_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Word" ("createdAt", "hint", "id", "kana", "kanji", "romaji", "sentence", "sentenceTranslation", "translation", "updatedAt", "userId", "videoEnd", "videoId", "videoStart") SELECT "createdAt", "hint", "id", "kana", "kanji", "romaji", "sentence", "sentenceTranslation", "translation", "updatedAt", "userId", "videoEnd", "videoId", "videoStart" FROM "Word";
DROP TABLE "Word";
ALTER TABLE "new_Word" RENAME TO "Word";
CREATE UNIQUE INDEX "Word_id_key" ON "Word"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
