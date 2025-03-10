import { Inject, Injectable } from '@nestjs/common';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { UserPaginationInput } from 'src/shared/types';
import {
  getFriendRequestCursor,
  getUserCursor,
} from 'src/domain/helpers/get-cursor';
import { SearchInput } from 'src/domain/types/user.types';
import { FriendNotFoundException } from 'src/domain/error/exceptions/not-found.exception';

@Injectable()
export class FriendsReader {
  constructor(
    @Inject(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
  ) {}

  async read(userId: string, paginationInput: UserPaginationInput) {
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

  async readOne(firstUserId: string, secondUserId: string) {
    const friend = await this.friendsRepository.findOneBySenderAndReceiverId(
      firstUserId,
      secondUserId,
    );
    if (!friend) {
      throw new FriendNotFoundException();
    }

    return friend;
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

  async readReceivedRequests(
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

  async readSentRequests(userId: string, paginationInput: UserPaginationInput) {
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

  async countRequests(userId: string) {
    const count = await this.friendsRepository.countRequest(userId);
    return { count };
  }
}
