import { BadRequestException, Injectable } from '@nestjs/common';
import { FriendsReader } from 'src/domain/components/friend/friends-reader';
import { IS_NOT_FRIEND_RELATION_MESSAGE } from 'src/domain/error/messages';

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
}
