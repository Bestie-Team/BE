import { UserPaginationInput, Provider } from 'src/shared/types';

export interface UserPrototype {
  readonly email: string;
  readonly name: string;
  readonly accountId: string;
  readonly profileImageUrl: string | null;
  readonly provider: Provider;
}

export interface UserBasicInfo {
  readonly id: string;
  readonly email: string;
  readonly accountId: string;
  readonly profileImageUrl: string | null;
  readonly provider: Provider;
}

export interface User {
  readonly id: string;
  readonly accountId: string;
  readonly name: string;
  readonly profileImageUrl: string | null;
}

export interface UserDetail extends User {
  groupCount: number;
  feedCount: number;
  friendCount: number;
}

export interface SearchInput {
  paginationInput: UserPaginationInput;
  search: string;
}
