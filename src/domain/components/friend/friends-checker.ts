import { Injectable } from '@nestjs/common';
import { FriendsReader } from 'src/domain/components/friend/friends-reader';
import {
  AlreadyExistRequestException,
  AlreadyFriendsException,
} from 'src/domain/error/exceptions/conflice.exception';
import { FriendNotFoundException } from 'src/domain/error/exceptions/not-found.exception';
import {
  FriendshipRequiredException,
  ReportedUserCannotRequestException,
} from 'src/domain/error/exceptions/unprocessable.exception';

@Injectable()
export class FriendsChecker {
  constructor(private readonly friendsReader: FriendsReader) {}

  async checkIsFriend(userId: string, friendId: string) {
    try {
      const friend = await this.friendsReader.readOne(friendId, userId);
      if (friend.status !== 'ACCEPTED') {
        throw new FriendshipRequiredException();
      }
    } catch (e: unknown) {
      if (e instanceof FriendNotFoundException) {
        throw new FriendshipRequiredException();
      }
      throw e;
    }
  }

  async checkIsFriendAll(userId: string, friendIds: string[]) {
    const friendChecks = friendIds.map(async (friendId) => {
      await this.checkIsFriend(userId, friendId);
    });

    await Promise.all(friendChecks);
  }

  async checkExistFriend(senderId: string, receiverId: string) {
    try {
      const existFriend = await this.friendsReader.readOne(
        senderId,
        receiverId,
      );
      if (existFriend) {
        if (existFriend.status === 'ACCEPTED') {
          throw new AlreadyFriendsException();
        }
        if (existFriend.status === 'PENDING') {
          throw new AlreadyExistRequestException();
        }
        // TODO 요구사항 변경에 따라 수정 가능성 있음.
        // TODO 검색에 노출 안 되도록
        if (existFriend.status === 'REPORTED') {
          throw new ReportedUserCannotRequestException();
        }
      }
    } catch (e: unknown) {
      if (e instanceof FriendNotFoundException) {
        return;
      }
      throw e;
    }
  }

  async checkExistPendingRequest(senderId: string, receiverId: string) {
    const friendRequest = await this.friendsReader.readOne(
      senderId,
      receiverId,
    );

    if (friendRequest.status === 'ACCEPTED') {
      throw new AlreadyFriendsException();
    }

    return friendRequest;
  }

  async checkExistAcceptedFriend(friendUserId: string, userId: string) {
    const friend = await this.friendsReader.readOne(friendUserId, userId);
    if (!friend || friend.status !== 'ACCEPTED') {
      throw new FriendNotFoundException();
    }

    return friend;
  }
}
