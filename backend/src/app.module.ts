import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ItemModule } from './item/item.module';
import { TradeModule } from './trade/trade.module';
import { ChatModule } from './chat/chat.module';
import { RatingModule } from './rating/rating.module';
import { TraderModule } from './trader/trader.module';
import { VerifierModule } from './verifier/verifier.module';
import { AdminModule } from './admin/admin.module';
import { CategoryModule } from './category/category.module';
import { NotificationModule } from './notification/notification.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    ItemModule,
    TradeModule,
    ChatModule,
    RatingModule,
    TraderModule,
    VerifierModule,
    AdminModule,
    CategoryModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
