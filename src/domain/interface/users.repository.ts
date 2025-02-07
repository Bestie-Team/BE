import { UserEntity } from 'src/domain/entities/user/user.entity';
import {
  Profile,
  SearchedUser,
  UserBasicInfo,
  UserDetail,
} from 'src/domain/types/user.types';
import { SearchInput } from 'src/infrastructure/types/user.types';

export interface UsersRepository {
  save(data: UserEntity): Promise<void>;
  findOneByEmail(email: string): Promise<UserBasicInfo | null>;
  // 현재는 존재 유무만 판별하면 돼서 id만 조회.
  findOneByAccountId(accountId: string): Promise<{ id: string } | null>;
  findOneById(
    id: string,
  ): Promise<{ id: string; createdAt: Date; updatedAt: Date } | null>;
  findByAccountIdContaining(
    userId: string,
    searchInput: SearchInput,
  ): Promise<SearchedUser[]>;
  findDetailById(id: string): Promise<UserDetail | null>;
  findProfileById(id: string): Promise<Profile | null>;
  update(data: Partial<UserEntity>): Promise<void>;
}

export const UsersRepository = Symbol('UsersRepository');
