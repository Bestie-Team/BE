import { User } from 'src/domain/types/user.types';

export const getUserCursor = (users: User[], limit: number): string | null => {
  return users[limit - 1]?.name || null;
};
