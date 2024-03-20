import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as Client } from '@prisma/client';

@Injectable()
export class PrismaClient extends Client implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
