import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendsReader } from 'src/domain/components/friend/friends-reader';
import {
  CANT_REQUEST_REPORTED_FRIEND_MESSAGE,
  FRIEND_ALREADY_EXIST_MESSAGE,
  FRIEND_REQUEST_ALREADY_EXIST_MESSAGE,
  IS_NOT_FRIEND_RELATION_MESSAGE,
  NOT_FOUND_FRIEND_MESSAGE,
} from 'src/domain/error/messages';

@Injectable()
export class FriendsChecker {
  constructor(private readonly friendsReader: FriendsReader) {}

  async checkIsFriend(userId: string, friendId: string) {
    const friend = await this.friendsReader.readOne(friendId, userId);
    if (!friend || friend.status !== 'ACCEPTED') {
      throw new BadRequestException(IS_NOT_FRIEND_RELATION_MESSAGE);
    }
  }

  async checkIsFriendAll(userId: string, friendIds: string[]) {
    const friendChecks = friendIds.map(async (friendId) => {
      await this.checkIsFriend(userId, friendId);
    });

    await Promise.all(friendChecks);
  }

  async checkExistFriend(senderId: string, receiverId: string) {
    const existFriend = await this.friendsReader.readOne(senderId, receiverId);

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

    return existFriend;
  }

  async checkExistPendingRequest(senderId: string, receiverId: string) {
    const friendRequest = await this.friendsReader.readOne(
      senderId,
      receiverId,
    );

    if (!friendRequest) {
      throw new NotFoundException(NOT_FOUND_FRIEND_MESSAGE);
    }

    if (friendRequest.status === 'ACCEPTED') {
      throw new ConflictException(FRIEND_ALREADY_EXIST_MESSAGE);
    }

    return friendRequest;
  }

  async checkExistAcceptedFriend(friendUserId: string, userId: string) {
    const friend = await this.friendsReader.readOne(friendUserId, userId);
    if (!friend || friend.status !== 'ACCEPTED') {
      throw new NotFoundException(IS_NOT_FRIEND_RELATION_MESSAGE);
    }

    return friend;
  }
}
