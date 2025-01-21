import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import {
  CANT_REQUEST_REPORTED_FRIEND_MESSAGE,
  FORBIDDEN_MESSAGE,
  FRIEND_ALREADY_EXIST_MESSAGE,
  FRIEND_REQUEST_ALREADY_EXIST_MESSAGE,
  IS_NOT_FRIEND_RELATION_MESSAGE,
  NOT_FOUND_FRIEND_MESSAGE,
} from 'src/domain/error/messages';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import { FriendPrototype } from 'src/domain/types/friend.types';
import { UserPaginationInput } from 'src/shared/types';
import {
  getFriendRequestCursor,
  getUserCursor,
} from 'src/domain/helpers/get-cursor';
import { SearchInput } from 'src/domain/types/user.types';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { Transactional } from '@nestjs-cls/transactional';

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

  async request(prototype: FriendPrototype) {
    const { senderId, receiverId } = prototype;
    await this.checkExistFriend(senderId, receiverId);

    const stdDate = new Date();
    const friend = FriendEntity.create(prototype, v4, stdDate);

    await this.friendsRepository.save(friend);
  }

  private async checkExistFriend(senderId: string, receiverId: string) {
    const existFriend =
      await this.friendsRepository.findOneBySenderAndReceiverId(
        senderId,
        receiverId,
      );
    if (existFriend) {
      if (existFriend.status === 'ACCEPTED') {
        throw new ConflictException(FRIEND_ALREADY_EXIST_MESSAGE);
      }
      if (existFriend.status === 'PENDING') {
        throw new ConflictException(FRIEND_REQUEST_ALREADY_EXIST_MESSAGE);
      }
      // TODO 요구사항 변경에 따라 수정 가능성 있음.
      if (existFriend.status === 'REPORTED') {
        throw new BadRequestException(CANT_REQUEST_REPORTED_FRIEND_MESSAGE);
      }
    }
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

  async delete(friendUserId: string, userId: string) {
    await this.checkExistAcceptedFriend(friendUserId, userId);
    await this.deleteTransaction(friendUserId, userId);
  }

  @Transactional()
  private async deleteTransaction(friendUserId: string, userId: string) {
    await this.deleteAllPendingGatheringInvitation(friendUserId, userId);
    await this.friendsRepository.deleteByUserIds(friendUserId, userId);
  }

  private async checkExistAcceptedFriend(friendUserId: string, userId: string) {
    const friend = await this.friendsRepository.findOneBySenderAndReceiverId(
      friendUserId,
      userId,
    );
    if (!friend || friend.status !== 'ACCEPTED') {
      throw new NotFoundException(IS_NOT_FRIEND_RELATION_MESSAGE);
    }
  }

  private deleteAllPendingGatheringInvitation(
    firstUserId: string,
    secondUserId: string,
  ) {
    return this.gatheringParticipationsRepository.deleteAllPendingInvitation(
      firstUserId,
      secondUserId,
    );
  }
}
