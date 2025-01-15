import { Module } from '@nestjs/common';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { FriendFeedVisibilitiesRepository } from 'src/domain/interface/feed/friend-feed-visibilities.repository';
import { FeedsWriteService } from 'src/domain/services/feed/feeds-write.service';
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
    { provide: FeedsRepository, useClass: FeedsPrismaRepository },
    {
      provide: FriendFeedVisibilitiesRepository,
      useClass: FriendFeedVisibilitiesPrismaRepository,
    },
  ],
})
export class FeedsModule {}
