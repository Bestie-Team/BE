import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendRequest } from 'src/domain/types/friend.types';
import { User } from 'src/domain/types/user.types';
import { UserPaginationInput } from 'src/shared/types';

export interface FriendsRepository {
  save(data: FriendEntity): Promise<void>;
  findOneById(id: string): Promise<{ id: string; receiverId: string } | null>;
  findAllFriendByUserId(
    userId: string,
    paginationInput: UserPaginationInput,
  ): Promise<User[]>;
  findAllReceivedRequestByUserId(
    userId: string,
    paginationInput: UserPaginationInput,
  ): Promise<FriendRequest[]>;
  update(id: string, data: Partial<FriendEntity>): Promise<void>;
  delete(id: string): Promise<void>;
}

export const FriendsRepository = Symbol('FriendsRepository');
