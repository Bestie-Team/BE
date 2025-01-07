import { v4 } from 'uuid';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { Provider } from 'src/shared/types';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendStatus } from '@prisma/client';

export const generateUserEntity = (
  email: string,
  accountId: string,
  name = '이름',
  profileImageUrl = 'https://image.com',
  provider: Provider = 'GOOGLE',
): UserEntity =>
  UserEntity.create(
    { accountId, email, name, profileImageUrl, provider },
    v4,
    new Date(),
  );

export const generateFriendEntity = (
  senderId: string,
  receiverId: string,
  status: FriendStatus = 'PENDING',
): FriendEntity => {
  const stdDate = new Date();
  return new FriendEntity(v4(), senderId, receiverId, stdDate, stdDate, status);
};
