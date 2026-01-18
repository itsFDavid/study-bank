/*
  Warnings:

  - You are about to drop the column `answerText` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "answerText",
ADD COLUMN     "answers" TEXT[];
