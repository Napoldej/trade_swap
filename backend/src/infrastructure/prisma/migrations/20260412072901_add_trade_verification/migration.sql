-- AlterEnum
ALTER TYPE "TradeStatus" ADD VALUE 'AWAITING_VERIFICATION';

-- AlterTable
ALTER TABLE "trades" ADD COLUMN     "verification_note" TEXT,
ADD COLUMN     "verification_rejected_reason" TEXT,
ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "verified_by" INTEGER;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
