import { Provider } from '../../shared/types';

export interface UsersRepository {
  findOneByEmail(email: string): Promise<{
    email: string;
    provider: Provider;
  } | null>;
}

export const UsersRepository = Symbol('UsersRepository');
