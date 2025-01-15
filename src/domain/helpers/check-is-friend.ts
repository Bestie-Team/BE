import { BadRequestException } from '@nestjs/common';
import { IS_NOT_FRIEND_RELATION_MESSAGE } from 'src/domain/error/messages';
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';

export const checkIsFriend = async (
  friendsRepository: FriendsRepository,
  userId: string,
  friendId: string,
) => {
  const friend = await friendsRepository.findOneBySenderAndReceiverId(
    friendId,
    userId,
  );
  if (!friend || friend.status !== 'ACCEPTED') {
    throw new BadRequestException(IS_NOT_FRIEND_RELATION_MESSAGE);
  }
};

export const checkIsFriendAll = async (
  friendsRepository: FriendsRepository,
  userId: string,
  friendIds: string[],
) => {
  const friendChecks = friendIds.map(async (friendId) => {
    await checkIsFriend(friendsRepository, userId, friendId);
  });

  await Promise.all(friendChecks);
};
