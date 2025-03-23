import { BlockedUserEntity } from 'src/domain/entities/user/blocked-user.entity';

export interface BlockedUsersRepository {
  save(data: BlockedUserEntity): Promise<void>;
}

export const BlockedUsersRepository = Symbol('BlockedUsersRepository');
