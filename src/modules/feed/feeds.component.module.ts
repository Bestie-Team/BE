import { Module } from '@nestjs/common';
import { FeedsReader } from 'src/domain/components/feed/feeds-reader';
import { FeedsWriter } from 'src/domain/components/feed/feeds-writer';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { FriendFeedVisibilitiesRepository } from 'src/domain/interface/feed/friend-feed-visibilities.repository';
import { FeedsPrismaRepository } from 'src/infrastructure/repositories/feed/feeds-prisma.repository';
import { FriendFeedVisibilitiesPrismaRepository } from 'src/infrastructure/repositories/feed/friend-feed-visibilities-prisma.repository';
import { FriendsModule } from 'src/modules/friend/friends.module';
import { GatheringsComponentModule } from 'src/modules/gathering/gatherings-component.module';

@Module({
  imports: [FriendsModule, GatheringsComponentModule],
  providers: [
    FeedsWriter,
    FeedsReader,
    { provide: FeedsRepository, useClass: FeedsPrismaRepository },
    {
      provide: FriendFeedVisibilitiesRepository,
      useClass: FriendFeedVisibilitiesPrismaRepository,
    },
  ],
  exports: [FeedsWriter, FeedsReader],
})
export class FeedsComponentModule {}
