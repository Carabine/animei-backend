-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kanji" TEXT NOT NULL,
    "kana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "sentenceTranslation" TEXT NOT NULL,
    "videoStart" INTEGER NOT NULL,
    "videoEnd" INTEGER NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "hint" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Word_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Word_id_key" ON "Word"("id");
