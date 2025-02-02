import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendRequest } from 'src/domain/types/friend.types';
import { User } from 'src/domain/types/user.types';
import { SearchInput } from 'src/infrastructure/types/user.types';
import { FriendStatus, UserPaginationInput } from 'src/shared/types';

export interface FriendsRepository {
  save(data: FriendEntity): Promise<void>;
  findOneById(id: string): Promise<{ id: string; receiverId: string } | null>;
  findFriendsByUserId(
    userId: string,
    paginationInput: UserPaginationInput,
  ): Promise<User[]>;
  findFriendsByAccountIdAndNameContaining(
    userId: string,
    searchInput: SearchInput,
  ): Promise<User[]>;
  findReceivedRequestsByUserId(
    userId: string,
    paginationInput: UserPaginationInput,
  ): Promise<FriendRequest[]>;
  findSentRequestsByUserId(
    userId: string,
    paginationInput: UserPaginationInput,
  ): Promise<FriendRequest[]>;
  findOneBySenderAndReceiverId(
    firstUserId: string,
    secondUserId: string,
  ): Promise<{ id: string; status: FriendStatus } | null>;
  findOneFriendByUserId(
    firstUserId: string,
    secondUserId: string,
  ): Promise<{
    senderId: string;
    receiverId: string;
  } | null>;
  update(id: string, data: Partial<FriendEntity>): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByUserIds(firstUserId: string, secondUserId: string): Promise<void>;
}

export const FriendsRepository = Symbol('FriendsRepository');
