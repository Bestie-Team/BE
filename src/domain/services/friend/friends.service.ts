import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import {
  FORBIDDEN_MESSAGE,
  NOT_FOUND_FRIEND_MESSAGE,
} from 'src/domain/error/messages';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { FriendPrototype } from 'src/domain/types/friend.types';
import { UserPaginationInput } from 'src/shared/types';
import {
  getFriendRequestCursor,
  getUserCursor,
} from 'src/domain/shared/get-cursor';
import { SearchInput } from 'src/domain/types/user.types';

@Injectable()
export class FriendsService {
  constructor(
    @Inject(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
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

  async request(prototype: FriendPrototype) {
    const stdDate = new Date();
    const friend = FriendEntity.create(prototype, v4, stdDate);

    await this.friendsRepository.save(friend);
  }

  async accept(friendId: string, receiverId: string) {
    await this.checkReceiver(friendId, receiverId);
    await this.friendsRepository.update(friendId, {
      status: 'ACCEPTED',
      updatedAt: new Date(),
    });
  }

  async reject(friendId: string, receiverId: string) {
    await this.checkReceiver(friendId, receiverId);
    await this.friendsRepository.delete(friendId);
  }

  async checkReceiver(friendId: string, receiverId: string) {
    const friendRequest = await this.friendsRepository.findOneById(friendId);
    if (!friendRequest) {
      throw new NotFoundException(NOT_FOUND_FRIEND_MESSAGE);
    }

    if (friendRequest.receiverId !== receiverId) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }
  }
}
