import { Length } from 'class-validator';
import { UserPaginationRequest } from 'src/presentation/dto/user/request/user-pagination.request';

export class SearchFriendRequest extends UserPaginationRequest {
  @Length(2, 20, {
    message: '검색어는 2자 이상 20자 이하만 가능합니다.',
  })
  readonly search: string;
}
