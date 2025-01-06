import { User } from 'src/domain/types/user.types';
import { UserCursor } from 'src/presentation/dto/shared/indexs';

export class SearchUserResponse {
  readonly users: User[];
  readonly nextCursor: UserCursor | null;
}
