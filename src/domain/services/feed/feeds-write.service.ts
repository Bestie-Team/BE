import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { CreateGatheringFeedInput } from 'src/domain/types/feed.types';
import {
  DUPLICATE_GATHERING_FEED,
  FEED_CREATION_PERIOD_EXCEEDED,
  FORBIDDEN_MESSAGE,
  IS_NOT_DONE_GATHERING_MESSAGE,
  IS_NOT_FRIEND_RELATION_MESSAGE,
  NOT_FOUND_GATHERING_MESSAGE,
} from 'src/domain/error/messages';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import { calcDiffDate } from 'src/utils/date';

@Injectable()
export class FeedsWriteService {
  constructor(
    @Inject(FeedsRepository)
    private readonly feedsRepository: FeedsRepository,
    @Inject(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
    @Inject(GatheringsRepository)
    private readonly gatheringsRepository: GatheringsRepository,
  ) {}

  async createGatheringFeed(
    input: CreateGatheringFeedInput,
    imageUrls: string[],
    today: Date = new Date(),
  ) {
    const { gatheringId, writerId } = input;
    await this.checkCreateGatheringFeedConstraint(gatheringId, writerId, today);

    const stdDate = new Date();
    const feed = FeedEntity.create(input, v4, stdDate);
    const images: FeedImageEntity[] = imageUrls.map((url) =>
      FeedImageEntity.create(url, v4, stdDate),
    );

    await this.feedsRepository.save(feed, images);
  }

  private async checkCreateGatheringFeedConstraint(
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
    if (diffDate <= 30) {
      throw new UnprocessableEntityException(FEED_CREATION_PERIOD_EXCEEDED);
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

  private async checkIsFriendAll(userId: string, friendIds: string[]) {
    const friendChecks = friendIds.map(async (friendId) => {
      const friend = await this.friendsRepository.findOneBySenderAndReceiverId(
        friendId,
        userId,
      );
      if (!friend || friend.status !== 'ACCEPTED') {
        throw new BadRequestException(IS_NOT_FRIEND_RELATION_MESSAGE);
      }
    });

    await Promise.all(friendChecks);
  }

  async updateContent(content: string, feedId: string, userId: string) {
    await this.checkOwnership(feedId, userId);
    await this.feedsRepository.update(feedId, { content });
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
