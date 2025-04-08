import { Inject, Injectable } from '@nestjs/common';
import { FriendFeedVisibilitiesRepository } from 'src/domain/interface/feed/friend-feed-visibilities.repository';

@Injectable()
export class FriendFeedVisibilityReader {
  constructor(
    @Inject(FriendFeedVisibilitiesRepository)
    private readonly friendFeedVisibilityRepository: FriendFeedVisibilitiesRepository,
  ) {}

  async readMembers(feedId: string) {
    return await this.friendFeedVisibilityRepository.findVisibleUsersByFeedId(
      feedId,
    );
  }
}
