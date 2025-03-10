import { UserEntity } from 'src/domain/entities/user/user.entity';
import {
  DeletedUser,
  Profile,
  SearchedUser,
  User,
  UserForLogin,
  UserDetail,
} from 'src/domain/types/user.types';
import { SearchInput } from 'src/infrastructure/types/user.types';

export interface UsersRepository {
  save(data: UserEntity): Promise<void>;
  findOneByEmail(email: string): Promise<UserForLogin | null>;
  findOneByAccountId(
    accountId: string,
  ): Promise<{ id: string; deletedAt: Date | null } | null>;
  findOneById(id: string): Promise<
    | (User & {
        serviceNotificationConsent: boolean;
        marketingNotificationConsent: boolean;
        notificationToken: string | null;
        createdAt: Date;
        updatedAt: Date;
      })
    | null
  >;
  findUsersByIds(ids: string[]): Promise<
    (User & {
      serviceNotificationConsent: boolean;
      marketingNotificationConsent: boolean;
      notificationToken: string | null;
      createdAt: Date;
      updatedAt: Date;
    })[]
  >;
  findByAccountIdContaining(
    userId: string,
    searchInput: SearchInput,
  ): Promise<SearchedUser[]>;
  findDetailById(id: string): Promise<UserDetail | null>;
  findProfileById(id: string): Promise<Profile | null>;
  findDeletedByEmail(email: string): Promise<DeletedUser | null>;
  update(data: Partial<UserEntity>): Promise<void>;
  delete(id: string): Promise<void>;
}

export const UsersRepository = Symbol('UsersRepository');
