import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from 'kysely';
import kyselyExtension from 'prisma-extension-kysely';
import { DB } from '../../../prisma/generated/types';
import { filterSoftDeleted } from 'src/infrastructure/prisma/extensions/soft-delete.extension';

declare module '@prisma/client' {
  interface PrismaClient {
    $kysely: Kysely<DB>;
  }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // 쿼리 모니터링 필요 시 사용
  // constructor() {
  //   super({ log: ['query'] });
  // }

  async onModuleInit() {
    const extension = this.$extends(
      kyselyExtension({
        kysely: (driver) =>
          new Kysely<DB>({
            dialect: {
              createDriver: () => driver,
              createAdapter: () => new PostgresAdapter(),
              createIntrospector: (db) => new PostgresIntrospector(db),
              createQueryCompiler: () => new PostgresQueryCompiler(),
            },
          }),
      }),
    );

    this.$kysely = extension.$kysely;
    await this.$connect();
    this.$extends(filterSoftDeleted);
  }
}
