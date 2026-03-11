-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TRADER', 'VERIFIER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "user_name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TRADER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "traders" (
    "trader_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_trades" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "traders_pkey" PRIMARY KEY ("trader_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "trader_items" (
    "item_id" SERIAL NOT NULL,
    "trader_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "status" "ItemStatus" NOT NULL DEFAULT 'PENDING',
    "verified_by" INTEGER,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trader_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "item_photos" (
    "photo_id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "photo_url" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_photos_pkey" PRIMARY KEY ("photo_id")
);

-- CreateTable
CREATE TABLE "trades" (
    "trade_id" SERIAL NOT NULL,
    "proposer_id" INTEGER NOT NULL,
    "proposer_item_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "receiver_item_id" INTEGER NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "trades_pkey" PRIMARY KEY ("trade_id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "rating_id" SERIAL NOT NULL,
    "trade_id" INTEGER NOT NULL,
    "rater_id" INTEGER NOT NULL,
    "ratee_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("rating_id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "conversation_id" SERIAL NOT NULL,
    "trade_id" INTEGER NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("conversation_id")
);

-- CreateTable
CREATE TABLE "messages" (
    "message_id" SERIAL NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_name_key" ON "users"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "traders_user_id_key" ON "traders"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_name_key" ON "categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_trade_id_rater_id_key" ON "ratings"("trade_id", "rater_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_trade_id_key" ON "conversations"("trade_id");

-- AddForeignKey
ALTER TABLE "traders" ADD CONSTRAINT "traders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trader_items" ADD CONSTRAINT "trader_items_trader_id_fkey" FOREIGN KEY ("trader_id") REFERENCES "traders"("trader_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trader_items" ADD CONSTRAINT "trader_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trader_items" ADD CONSTRAINT "trader_items_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_photos" ADD CONSTRAINT "item_photos_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "trader_items"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_proposer_id_fkey" FOREIGN KEY ("proposer_id") REFERENCES "traders"("trader_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "traders"("trader_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_proposer_item_id_fkey" FOREIGN KEY ("proposer_item_id") REFERENCES "trader_items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_receiver_item_id_fkey" FOREIGN KEY ("receiver_item_id") REFERENCES "trader_items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "trades"("trade_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_rater_id_fkey" FOREIGN KEY ("rater_id") REFERENCES "traders"("trader_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_ratee_id_fkey" FOREIGN KEY ("ratee_id") REFERENCES "traders"("trader_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "trades"("trade_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("conversation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "traders"("trader_id") ON DELETE RESTRICT ON UPDATE CASCADE;
