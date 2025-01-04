import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { User } from 'src/domain/types/user.types';
import { PaginationInput } from 'src/shared/types';

export interface FriendsRepository {
  save(data: FriendEntity): Promise<void>;
  findOneById(id: string): Promise<{ id: string; receiverId: string } | null>;
  findAllFriendByUserId(
    userId: string,
    paginationInput: PaginationInput,
  ): Promise<User[]>;
  update(id: string, data: Partial<FriendEntity>): Promise<void>;
  delete(id: string): Promise<void>;
}

export const FriendsRepository = Symbol('FriendsRepository');
