import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NOT_FOUND_FEED_MESSAGE } from 'src/domain/error/messages';
import { getFeedCursor } from 'src/domain/helpers/get-cursor';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { FriendFeedVisibilitiesRepository } from 'src/domain/interface/feed/friend-feed-visibilities.repository';
import { Feed, FeedPaginationInput } from 'src/domain/types/feed.types';
import { User } from 'src/domain/types/user.types';
import { DateIdPaginationInput } from 'src/shared/types';

@Injectable()
export class FeedsReader {
  constructor(
    @Inject(FeedsRepository)
    private readonly feedsRepository: FeedsRepository,
    @Inject(FriendFeedVisibilitiesRepository)
    private readonly friendFeedVisibilitiesRepository: FriendFeedVisibilitiesRepository,
  ) {}

  async readOne(id: string) {
    const feed = await this.feedsRepository.findOneById(id);
    if (!feed) {
      throw new NotFoundException(NOT_FOUND_FEED_MESSAGE);
    }

    return feed;
  }

  async readAll(userId: string, feedPaginationInput: FeedPaginationInput) {
    return await this.getFeeds(userId, feedPaginationInput, 'ALL');
  }

  async readOwn(userId: string, feedPaginationInput: FeedPaginationInput) {
    return await this.getFeeds(userId, feedPaginationInput, 'MY');
  }

  async readBlocked(userId: string, paginationInput: DateIdPaginationInput) {
    return await this.feedsRepository.findBlockedFeedsByUserId(
      userId,
      paginationInput,
    );
  }

  private async getCommonFeedWithMember(
    feeds: Feed[],
  ): Promise<{ [feedId: string]: User[] }> {
    const commonFeeds = feeds.filter((feed) => !feed.gathering);
    return commonFeeds.length > 0
      ? await this.friendFeedVisibilitiesRepository.findVisibleUsersByFeedIds(
          commonFeeds.map((feed) => feed.id),
        )
      : {};
  }

  private async getFeeds(
    userId: string,
    feedPaginationInput: FeedPaginationInput,
    type: 'ALL' | 'MY',
  ) {
    const { limit } = feedPaginationInput;
    const feeds =
      type === 'ALL'
        ? await this.feedsRepository.findAllByUserId(
            userId,
            feedPaginationInput,
          )
        : await this.feedsRepository.findByUserId(userId, feedPaginationInput);
    const nextCursor = getFeedCursor(feeds, limit);
    const withMembers = await this.getCommonFeedWithMember(feeds);
    const feedsWithMembers = feeds.map((feed) => {
      const members = feed.gathering
        ? feed.withMembers
        : withMembers[feed.id] || [];
      return {
        ...feed,
        withMembers: members,
      };
    });

    return {
      feeds: feedsWithMembers,
      nextCursor,
    };
  }
}
