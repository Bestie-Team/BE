import { FriendEntity } from 'src/domain/entities/friend/friend.entity';

export interface FriendsRepository {
  save(data: FriendEntity): Promise<void>;
  findOneById(id: string): Promise<{ id: string; receiverId: string } | null>;
  update(id: string, data: Partial<FriendEntity>): Promise<void>;
  delete(id: string): Promise<void>;
}

export const FriendsRepository = Symbol('FriendsRepository');
