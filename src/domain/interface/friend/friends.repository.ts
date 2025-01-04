import { FriendEntity } from 'src/domain/entities/friend/friend.entity';

export interface FriendsRepository {
  save(entity: FriendEntity): Promise<void>;
}

export const FriendsRepository = Symbol('FriendsRepository');
