import { Length } from 'class-validator';
import { UserPaginationRequest } from './user-pagination.request';

export class SearchUserRequest extends UserPaginationRequest {
  @Length(2, 15, {
    message: '아이디 검색어는 2자 이상 15자 이하만 가능합니다.',
  })
  readonly search: string;
}
