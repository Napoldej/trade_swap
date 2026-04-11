-- CreateTable
CREATE TABLE "conversation_reads" (
    "id" SERIAL NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "trader_id" INTEGER NOT NULL,
    "last_read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_reads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversation_reads_conversation_id_trader_id_key" ON "conversation_reads"("conversation_id", "trader_id");

-- AddForeignKey
ALTER TABLE "conversation_reads" ADD CONSTRAINT "conversation_reads_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("conversation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_reads" ADD CONSTRAINT "conversation_reads_trader_id_fkey" FOREIGN KEY ("trader_id") REFERENCES "traders"("trader_id") ON DELETE CASCADE ON UPDATE CASCADE;
