import { UserEntity } from 'src/domain/entities/user/user.entity';
import { User, UserBasicInfo } from 'src/domain/types/user.types';
import { SearchInput } from 'src/infrastructure/types/user.types';

export interface UsersRepository {
  save(data: UserEntity): Promise<void>;
  findOneByEmail(email: string): Promise<UserBasicInfo | null>;
  // 현재는 존재 유무만 판별하면 돼서 id만 조회.
  findOneByAccountId(accountId: string): Promise<{ id: string } | null>;
  findByAccountIdContaining(
    userId: string,
    searchInput: SearchInput,
  ): Promise<User[]>;
}

export const UsersRepository = Symbol('UsersRepository');
