import { FriendRequest } from 'src/domain/types/friend.types';
import { UserCursor } from 'src/presentation/dto/shared/indexs';

export class FriendRequestListResponse {
  readonly requests: FriendRequest[];
  readonly nextCursor: UserCursor | null;
}
