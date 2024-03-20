import { Global, Module } from '@nestjs/common';
import { PrismaClient } from './prisma.service';

@Global()
@Module({
  providers: [PrismaClient],
  exports: [PrismaClient],
})
export class PrismaModule {}
