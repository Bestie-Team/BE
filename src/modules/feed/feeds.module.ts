import { Module } from '@nestjs/common';
import { FeedsController } from 'src/presentation/controllers/feed/feeds.controller';
import { FeedsComponentModule } from 'src/modules/feed/feeds.component.module';
import { BlockedFeedsModule } from 'src/modules/feed/blocked-feeds.module';
import { FeedsService } from 'src/domain/services/feed/feeds.service';
import { FriendsCheckerModule } from 'src/modules/friend/friends-chcker.module';
import { GatheringsComponentModule } from 'src/modules/gathering/gatherings-component.module';

@Module({
  imports: [
    BlockedFeedsModule,
    FeedsComponentModule,
    FriendsCheckerModule,
    GatheringsComponentModule,
  ],
  controllers: [FeedsController],
  providers: [FeedsService],
  exports: [],
})
export class FeedsModule {}
