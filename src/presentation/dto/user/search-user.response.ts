import { User } from 'src/domain/types/user.types';

export class SearchUserResponse {
  readonly users: User[];
  readonly nextCursor: string | null;
}
