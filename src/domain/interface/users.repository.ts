import { UserBasicInfo } from '../types/user.types';

export interface UsersRepository {
  findOneByEmail(email: string): Promise<UserBasicInfo | null>;
}

export const UsersRepository = Symbol('UsersRepository');
