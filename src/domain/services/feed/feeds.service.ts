import { Transactional } from '@nestjs-cls/transactional';
import { v4 } from 'uuid';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { FeedsReader } from 'src/domain/components/feed/feeds-reader';
import { FeedsWriter } from 'src/domain/components/feed/feeds-writer';
import { FriendsChecker } from 'src/domain/components/friend/friends-checker';
import { GatheringsReader } from 'src/domain/components/gathering/gatherings-reader';
import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';
import { FriendFeedVisibilityEntity } from 'src/domain/entities/feed/friend-feed-visibility.entity';
import { FORBIDDEN_MESSAGE } from 'src/domain/error/messages';
import {
  CreateGatheringFeedInput,
  FeedPrototype,
} from 'src/domain/types/feed.types';
import { calcDateDiff } from 'src/utils/date';
import { GatheringInvitationsReader } from 'src/domain/components/gathering/gathering-invitations-reader';
import {
  FeedNotFoundException,
  GatheringParticipationNotFoundException,
} from 'src/domain/error/exceptions/not-found.exception';
import {
  FeedCreationPeriodExceededException,
  GatheringNotCompletedException,
} from 'src/domain/error/exceptions/unprocessable.exception';
import { DuplicateFeedException } from 'src/domain/error/exceptions/conflice.exception';
import { NotificationsManager } from 'src/domain/components/notification/notification-manager';

@Injectable()
export class FeedsService {
  constructor(
    private readonly feedsReader: FeedsReader,
    private readonly feedsWriter: FeedsWriter,
    private readonly friendsChecker: FriendsChecker,
    private readonly gatheringsReader: GatheringsReader,
    private readonly gatheringParticipationReader: GatheringInvitationsReader,
    private readonly notifyManager: NotificationsManager,
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

    this.notifyManager.notifyFriendFeedCreation(
      feed.id,
      feed.writerId,
      visibilities.map((visibilitie) => visibilitie.userId),
    );
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
      throw new GatheringNotCompletedException();
    }
    await this.checkIsParticipation(gatheringId, writerId);
    await this.checkFeedCreationPeriod(today, gathering.endedAt);
    await this.checkDuplicateFeed(gatheringId, writerId);
  }

  private async checkFeedCreationPeriod(today: Date, endedAt: Date) {
    const diffDate = calcDateDiff(today, endedAt, 'd');
    if (diffDate >= 30) {
      throw new FeedCreationPeriodExceededException();
    }
  }

  private async checkIsParticipation(gatheringId: string, writerId: string) {
    try {
      await this.gatheringParticipationReader.readOne(gatheringId, writerId);
    } catch (e: unknown) {
      if (e instanceof GatheringParticipationNotFoundException) {
        throw new ForbiddenException(FORBIDDEN_MESSAGE);
      }
      throw e;
    }
  }

  private async checkDuplicateFeed(gatheringId: string, writerId: string) {
    try {
      await this.feedsReader.readOneByGatheringIdAndWriterId(
        gatheringId,
        writerId,
      );
      throw new DuplicateFeedException();
    } catch (e: unknown) {
      if (e instanceof FeedNotFoundException) {
        return;
      }
      throw e;
    }
  }
}
