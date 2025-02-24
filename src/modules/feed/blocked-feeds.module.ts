import { Module } from '@nestjs/common';
import { BlockedFeedsService } from 'src/domain/components/feed/blocked-feeds.service';
import { BlockedFeedsRepository } from 'src/domain/interface/feed/blocked-feeds.repository';
import { BlockedFeedsPrismaRepository } from 'src/infrastructure/repositories/feed/blocked-feeds-prisma.repository';
import { FeedsComponentModule } from 'src/modules/feed/feeds.component.module';

@Module({
  imports: [FeedsComponentModule],
  providers: [
    BlockedFeedsService,
    {
      provide: BlockedFeedsRepository,
      useClass: BlockedFeedsPrismaRepository,
    },
  ],
  exports: [BlockedFeedsService],
})
export class BlockedFeedsModule {}
