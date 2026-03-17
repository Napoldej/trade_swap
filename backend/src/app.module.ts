import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ItemModule } from './item/item.module';
import { TradeModule } from './trade/trade.module';
import { ChatModule } from './chat/chat.module';
import { RatingModule } from './rating/rating.module';
import { VerifierModule } from './verifier/verifier.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    ItemModule,
    TradeModule,
    ChatModule,
    RatingModule,
    VerifierModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
