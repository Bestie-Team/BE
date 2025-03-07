import { UserPaginationInput } from 'src/shared/types';

export interface SearchInput {
  paginationInput: UserPaginationInput;
  search: string;
}
