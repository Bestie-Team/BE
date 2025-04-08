import { Module } from '@nestjs/common';
import { FriendFeedVisibilityReader } from 'src/domain/components/friend-feed-visibility/friend-feed-visibility-reader';
import { FriendFeedVisibilitiesRepository } from 'src/domain/interface/feed/friend-feed-visibilities.repository';
import { FriendFeedVisibilitiesPrismaRepository } from 'src/infrastructure/repositories/feed/friend-feed-visibilities-prisma.repository';

@Module({
  providers: [
    FriendFeedVisibilityReader,
    {
      provide: FriendFeedVisibilitiesRepository,
      useClass: FriendFeedVisibilitiesPrismaRepository,
    },
  ],
  exports: [FriendFeedVisibilityReader],
})
export class FriendFeedVisibilityComponentModule {}
