import { FriendEntity } from 'src/domain/entities/friend/friend.entity';

export interface FriendsRepository {
  save(data: FriendEntity): Promise<void>;
  update(friendId: string, data: Partial<FriendEntity>): Promise<void>;
}

export const FriendsRepository = Symbol('FriendsRepository');
