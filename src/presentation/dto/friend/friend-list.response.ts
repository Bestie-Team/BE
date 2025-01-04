import { User } from 'src/domain/types/user.types';

export class FriendListResponse {
  readonly users: User[];
  readonly nextCursor: string | null;
}
