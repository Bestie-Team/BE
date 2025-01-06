import { UserCursor } from 'src/presentation/dto/shared/indexs';
import { User } from 'src/presentation/dto/user/response/data.types';

export class SearchUserResponse {
  readonly users: User[];
  readonly nextCursor: UserCursor | null;
}
