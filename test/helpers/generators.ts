import { v4 } from 'uuid';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { Provider } from 'src/shared/types';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';

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
): FriendEntity =>
  FriendEntity.create(
    {
      senderId,
      receiverId,
    },
    v4,
    new Date(),
  );
