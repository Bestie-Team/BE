import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { FORBIDDEN_MESSAGE } from 'src/domain/error/messages';
import { FriendFeedVisibilityEntity } from 'src/domain/entities/feed/friend-feed-visibility.entity';
import { FriendFeedVisibilitiesRepository } from 'src/domain/interface/feed/friend-feed-visibilities.repository';

@Injectable()
export class FeedsWriter {
  constructor(
    @Inject(FeedsRepository)
    private readonly feedsRepository: FeedsRepository,
    @Inject(FriendFeedVisibilitiesRepository)
    private readonly friendFeedVisibilitiesRepository: FriendFeedVisibilitiesRepository,
  ) {}

  async create(feed: FeedEntity, images: FeedImageEntity[]) {
    await this.feedsRepository.save(feed, images);
  }

  async updateContent(content: string, feedId: string, userId: string) {
    await this.checkOwnership(feedId, userId);
    await this.feedsRepository.update(feedId, { content });
  }

  async delete(id: string, writerId: string) {
    await this.checkOwnership(id, writerId);
    await this.feedsRepository.delete(id);
  }

  async createFriendFeedVisibilities(
    visibilities: FriendFeedVisibilityEntity[],
  ) {
    await this.friendFeedVisibilitiesRepository.saveMany(visibilities);
  }

  private async checkOwnership(feedId: string, ownerId: string) {
    const exist = await this.feedsRepository.findOneByIdAndWriter(
      feedId,
      ownerId,
    );
    if (!exist) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }
  }
}
