import { Module } from '@nestjs/common';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { FeedsWriteService } from 'src/domain/services/feed/feeds-write.service';
import { FeedsPrismaRepository } from 'src/infrastructure/repositories/feed/feeds-prisma.repository';
import { FeedsController } from 'src/presentation/controllers/feed/feeds.controller';

@Module({
  controllers: [FeedsController],
  providers: [
    FeedsWriteService,
    { provide: FeedsRepository, useClass: FeedsPrismaRepository },
  ],
})
export class FeedsModule {}
