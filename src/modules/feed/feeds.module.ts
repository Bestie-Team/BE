import { Module } from '@nestjs/common';
import { BlockedFeedsRepository } from 'src/domain/interface/feed/blocked-feeds.repository';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { FriendFeedVisibilitiesRepository } from 'src/domain/interface/feed/friend-feed-visibilities.repository';
import { BlockedFeedsService } from 'src/domain/services/feed/blocked-feeds.service';
import { FeedsReadService } from 'src/domain/services/feed/feeds-read.service';
import { FeedsWriteService } from 'src/domain/services/feed/feeds-write.service';
import { BlockedFeedsPrismaRepository } from 'src/infrastructure/repositories/feed/blocked-feeds-prisma.repository';
import { FeedsPrismaRepository } from 'src/infrastructure/repositories/feed/feeds-prisma.repository';
import { FriendFeedVisibilitiesPrismaRepository } from 'src/infrastructure/repositories/feed/friend-feed-visibilities-prisma.repository';
import { FriendsModule } from 'src/modules/friend/friends.module';
import { GatheringsModule } from 'src/modules/gathering/gatherings.module';
import { FeedsController } from 'src/presentation/controllers/feed/feeds.controller';

@Module({
  imports: [FriendsModule, GatheringsModule],
  controllers: [FeedsController],
  providers: [
    FeedsWriteService,
    FeedsReadService,
    BlockedFeedsService,
    { provide: FeedsRepository, useClass: FeedsPrismaRepository },
    {
      provide: FriendFeedVisibilitiesRepository,
      useClass: FriendFeedVisibilitiesPrismaRepository,
    },
    {
      provide: BlockedFeedsRepository,
      useClass: BlockedFeedsPrismaRepository,
    },
  ],
})
export class FeedsModule {}
