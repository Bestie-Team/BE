import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { v4 } from 'uuid';
import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import {
  CreateGatheringFeedInput,
  FeedPrototype,
} from 'src/domain/types/feed.types';
import {
  DUPLICATE_GATHERING_FEED,
  FEED_CREATION_PERIOD_EXCEEDED_MESSAGE,
  FORBIDDEN_MESSAGE,
  IS_NOT_DONE_GATHERING_MESSAGE,
  NOT_FOUND_GATHERING_MESSAGE,
} from 'src/domain/error/messages';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import { calcDiffDate } from 'src/utils/date';
import { FriendFeedVisibilityEntity } from 'src/domain/entities/feed/friend-feed-visibility.entity';
import { FriendFeedVisibilitiesRepository } from 'src/domain/interface/feed/friend-feed-visibilities.repository';
import { checkIsFriendAll } from 'src/domain/helpers/check-is-friend';

@Injectable()
export class FeedsWriteService {
  constructor(
    @Inject(FeedsRepository)
    private readonly feedsRepository: FeedsRepository,
    @Inject(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
    @Inject(GatheringsRepository)
    private readonly gatheringsRepository: GatheringsRepository,
    @Inject(FriendFeedVisibilitiesRepository)
    private readonly friendFeedVisibilitiesRepository: FriendFeedVisibilitiesRepository,
  ) {}

  async createGatheringFeed(
    input: CreateGatheringFeedInput,
    imageUrls: string[],
    today: Date = new Date(),
  ) {
    const { gatheringId, writerId } = input;
    await this.checkCreateGatheringFeedConstraints(
      gatheringId,
      writerId,
      today,
    );

    const stdDate = new Date();
    const feed = FeedEntity.create(input, v4, stdDate);
    const images: FeedImageEntity[] = imageUrls.map((url, index) =>
      FeedImageEntity.create({ url, index }, v4, stdDate),
    );

    await this.feedsRepository.save(feed, images);
  }

  async createFriendFeed(
    prototype: FeedPrototype,
    imageUrls: string[],
    friendIds: string[],
  ) {
    const { writerId } = prototype;
    await checkIsFriendAll(this.friendsRepository, writerId, friendIds);
    await this.createFriendFeedTransaction(prototype, imageUrls, friendIds);
  }

  async updateContent(content: string, feedId: string, userId: string) {
    await this.checkOwnership(feedId, userId);
    await this.feedsRepository.update(feedId, { content });
  }

  async delete(id: string, writerId: string) {
    await this.checkOwnership(id, writerId);
    await this.feedsRepository.delete(id);
  }

  private async checkCreateGatheringFeedConstraints(
    gatheringId: string,
    writerId: string,
    today: Date,
  ) {
    const gathering = await this.gatheringsRepository.findOneById(gatheringId);
    if (!gathering) {
      throw new NotFoundException(NOT_FOUND_GATHERING_MESSAGE);
    }
    if (!gathering.endedAt) {
      throw new UnprocessableEntityException(IS_NOT_DONE_GATHERING_MESSAGE);
    }
    const diffDate = calcDiffDate(today, gathering.endedAt);
    if (diffDate >= 30) {
      throw new UnprocessableEntityException(
        FEED_CREATION_PERIOD_EXCEEDED_MESSAGE,
      );
    }
    const existFeed =
      await this.feedsRepository.findOneByGatheringIdAndWriterId(
        gatheringId,
        writerId,
      );
    if (existFeed) {
      throw new ConflictException(DUPLICATE_GATHERING_FEED);
    }
  }

  @Transactional()
  private async createFriendFeedTransaction(
    prototype: FeedPrototype,
    imageUrls: string[],
    friendIds: string[],
  ) {
    const feedId = await this.saveFeed(prototype, imageUrls);
    await this.saveFriendFeedVisibilities(feedId, friendIds);
  }

  private async saveFeed(prototype: FeedPrototype, imageUrls: string[]) {
    const stdDate = new Date();
    const feed = FeedEntity.create(prototype, v4, stdDate);
    const images: FeedImageEntity[] = imageUrls.map((url, index) =>
      FeedImageEntity.create({ url, index }, v4, stdDate),
    );
    await this.feedsRepository.save(feed, images);

    return feed.id;
  }

  private async saveFriendFeedVisibilities(
    feedId: string,
    friendIds: string[],
  ) {
    const stdDate = new Date();
    const friendFeedVisibilities = friendIds.map((friendId) =>
      FriendFeedVisibilityEntity.create({ feedId, userId: friendId }, stdDate),
    );
    await this.friendFeedVisibilitiesRepository.saveMany(
      friendFeedVisibilities,
    );
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
