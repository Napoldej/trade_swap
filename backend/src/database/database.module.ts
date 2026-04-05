import { DatabaseService } from "./database.service";
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [],
  providers: [DatabaseService],
  exports: [DatabaseService],
})

export class DatabaseModule {}