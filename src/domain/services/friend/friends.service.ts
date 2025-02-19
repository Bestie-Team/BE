import { Inject, Injectable } from '@nestjs/common';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { UserPaginationInput } from 'src/shared/types';
import {
  getFriendRequestCursor,
  getUserCursor,
} from 'src/domain/helpers/get-cursor';
import { SearchInput } from 'src/domain/types/user.types';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';

@Injectable()
export class FriendsService {
  constructor(
    @Inject(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
    @Inject(GatheringParticipationsRepository)
    private readonly gatheringParticipationsRepository: GatheringParticipationsRepository,
  ) {}

  async getFriendsByUserId(
    userId: string,
    paginationInput: UserPaginationInput,
  ) {
    const users = await this.friendsRepository.findFriendsByUserId(
      userId,
      paginationInput,
    );
    const nextCursor = getUserCursor(users, paginationInput.limit);

    return {
      users,
      nextCursor,
    };
  }

  async search(userId: string, searchInput: SearchInput) {
    const { search, paginationInput } = searchInput;
    const searchedUsers =
      await this.friendsRepository.findFriendsByAccountIdAndNameContaining(
        userId,
        { search, paginationInput },
      );
    const nextCursor = getUserCursor(searchedUsers, paginationInput.limit);

    return {
      users: searchedUsers,
      nextCursor,
    };
  }

  async getReceivedRequestsByUserId(
    userId: string,
    paginationInput: UserPaginationInput,
  ) {
    const requests = await this.friendsRepository.findReceivedRequestsByUserId(
      userId,
      paginationInput,
    );
    const nextCursor = getFriendRequestCursor(requests, paginationInput.limit);

    return {
      requests,
      nextCursor,
    };
  }

  async getSentRequestsByUserId(
    userId: string,
    paginationInput: UserPaginationInput,
  ) {
    const requests = await this.friendsRepository.findSentRequestsByUserId(
      userId,
      paginationInput,
    );
    const nextCursor = getFriendRequestCursor(requests, paginationInput.limit);

    return {
      requests,
      nextCursor,
    };
  }
}
