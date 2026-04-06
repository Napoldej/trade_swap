import { Module } from '@nestjs/common';
import { VerifierController } from './verifier.controller';
import { VerifierService } from './verifier.service';
import { VerifierRepository } from './verifier.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [VerifierController],
  providers: [VerifierService, VerifierRepository],
  exports: [VerifierService, VerifierRepository],
})
export class VerifierModule {}
