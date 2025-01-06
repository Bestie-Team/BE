import { UserPaginationInput, Provider } from 'src/shared/types';

export interface UserPrototype {
  readonly email: string;
  readonly name: string;
  readonly accountId: string;
  readonly profileImageUrl: string;
  readonly provider: Provider;
}

export interface UserBasicInfo {
  readonly id: string;
  readonly email: string;
  readonly provider: Provider;
}

export interface User {
  readonly id: string;
  readonly accountId: string;
  readonly name: string;
  readonly profileImageUrl: string;
}

export interface SearchInput {
  paginationInput: UserPaginationInput;
  search: string;
}
