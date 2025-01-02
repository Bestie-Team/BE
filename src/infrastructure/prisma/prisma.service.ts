import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // 쿼리 모니터링 필요 시 사용
  // constructor() {
  //   super({ log: ['query'] });
  // }

  async onModuleInit() {
    await this.$connect();
  }
}
