import { User } from 'src/domain/types/user.types';
import { UserCursor } from 'src/presentation/dto/shared/indexs';

export class FriendListResponse {
  readonly users: User[];
  readonly nextCursor: UserCursor | null;
}
