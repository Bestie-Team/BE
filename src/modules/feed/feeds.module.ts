import { Module } from '@nestjs/common';
import { BlockedFeedsRepository } from 'src/domain/interface/feed/blocked-feeds.repository';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { FriendFeedVisibilitiesRepository } from 'src/domain/interface/feed/friend-feed-visibilities.repository';
import { BlockedFeedsService } from 'src/domain/components/feed/blocked-feeds.service';
import { FeedsReader } from 'src/domain/components/feed/feeds-reader';
import { FeedsWriter } from 'src/domain/components/feed/feeds-writer';
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
    FeedsWriter,
    FeedsReader,
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
  exports: [
    FeedsReader,
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
