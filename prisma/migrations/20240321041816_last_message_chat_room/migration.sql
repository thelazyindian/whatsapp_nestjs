-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "lastMessagedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
