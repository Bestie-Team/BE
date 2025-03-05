import { Transactional } from '@nestjs-cls/transactional';
import { v4 } from 'uuid';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { FeedsReader } from 'src/domain/components/feed/feeds-reader';
import { FeedsWriter } from 'src/domain/components/feed/feeds-writer';
import { FriendsChecker } from 'src/domain/components/friend/friends-checker';
import { GatheringsReader } from 'src/domain/components/gathering/gatherings-reader';
import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';
import { FriendFeedVisibilityEntity } from 'src/domain/entities/feed/friend-feed-visibility.entity';
import {
  FEED_CREATION_PERIOD_EXCEEDED_MESSAGE,
  IS_NOT_DONE_GATHERING_MESSAGE,
} from 'src/domain/error/messages';
import {
  CreateGatheringFeedInput,
  FeedPrototype,
} from 'src/domain/types/feed.types';
import { calcDateDiff } from 'src/utils/date';

@Injectable()
export class FeedsService {
  constructor(
    private readonly feedsReader: FeedsReader,
    private readonly feedsWriter: FeedsWriter,
    private readonly friendsChecker: FriendsChecker,
    private readonly gatheringsReader: GatheringsReader,
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

    await this.feedsWriter.create(feed, images);
  }

  async createFriendFeed(
    prototype: FeedPrototype,
    imageUrls: string[],
    friendIds: string[],
  ) {
    const { writerId } = prototype;
    await this.friendsChecker.checkIsFriendAll(writerId, friendIds);

    const stdDate = new Date();
    const feed = FeedEntity.create(prototype, v4, stdDate);
    const images = FeedImageEntity.createBulk(imageUrls, v4, stdDate);
    const visibilities = FriendFeedVisibilityEntity.createBulk(
      feed.id,
      friendIds,
      stdDate,
    );

    await this.friendFeedTransaction(feed, images, visibilities);
  }

  @Transactional()
  private async friendFeedTransaction(
    feed: FeedEntity,
    images: FeedImageEntity[],
    visibilities: FriendFeedVisibilityEntity[],
  ) {
    await this.feedsWriter.create(feed, images);
    await this.feedsWriter.createFriendFeedVisibilities(visibilities);
  }

  private async checkCreateGatheringFeedConstraints(
    gatheringId: string,
    writerId: string,
    today: Date,
  ) {
    const gathering = await this.gatheringsReader.readOne(gatheringId);

    if (!gathering.endedAt) {
      throw new UnprocessableEntityException(IS_NOT_DONE_GATHERING_MESSAGE);
    }

    const diffDate = calcDateDiff(today, gathering.endedAt, 'd');
    if (diffDate >= 30) {
      throw new UnprocessableEntityException(
        FEED_CREATION_PERIOD_EXCEEDED_MESSAGE,
      );
    }

    try {
      await this.feedsReader.readOneByGatheringIdAndWriterId(
        gatheringId,
        writerId,
      );
    } catch (e: unknown) {
      return;
    }
  }
}
