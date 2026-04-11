import { Module } from '@nestjs/common';
import { VerifierController } from './verifier.controller';
import { VerifierService } from './verifier.service';
import { VerifierRepository } from './verifier.repository';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AuthModule, NotificationModule],
  controllers: [VerifierController],
  providers: [VerifierService, VerifierRepository],
  exports: [VerifierService, VerifierRepository],
})
export class VerifierModule {}
