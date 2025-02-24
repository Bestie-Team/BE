import { Module } from '@nestjs/common';
import { FeedsController } from 'src/presentation/controllers/feed/feeds.controller';
import { FeedsComponentModule } from 'src/modules/feed/feeds.component.module';
import { BlockedFeedsModule } from 'src/modules/feed/blocked-feeds.module';

@Module({
  imports: [BlockedFeedsModule, FeedsComponentModule],
  controllers: [FeedsController],
  providers: [],
  exports: [],
})
export class FeedsModule {}
