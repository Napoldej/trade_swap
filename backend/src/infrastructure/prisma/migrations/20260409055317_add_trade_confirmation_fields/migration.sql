-- AlterTable
ALTER TABLE "trades" ADD COLUMN     "proposer_confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "receiver_confirmed" BOOLEAN NOT NULL DEFAULT false;
