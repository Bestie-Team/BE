import { UserPaginationInput, Provider } from 'src/shared/types';
import { FriendRequestStatus } from 'src/shared/types/index';

export interface UserPrototype {
  readonly email: string;
  readonly name: string;
  readonly accountId: string;
  readonly profileImageUrl: string | null;
  readonly provider: Provider;
  readonly termsOfServiceConsent: boolean;
  readonly privacyPolicyConsent: boolean;
}

export interface UserInfo {
  readonly email: string;
  readonly name: string;
  readonly provider: Provider;
}

export interface UserForLogin {
  readonly id: string;
  readonly email: string;
  readonly accountId: string;
  readonly profileImageUrl: string | null;
  readonly provider: Provider;
  readonly deletedAt: Date | null;
}

/**
 * 회원의 최소 정보, 다른 도메인에서 대부분의 User는 해당 타입이며 필요시 확장하여 사용. 변경x
 */
export interface User {
  readonly id: string;
  readonly accountId: string;
  readonly name: string;
  readonly profileImageUrl: string | null;
}

export interface DeletedUser extends User {
  readonly deletedAt: Date | null;
  readonly provider: Provider;
}

export interface SearchedUser extends User {
  readonly status: FriendRequestStatus;
}

export interface UserDetail extends User {
  readonly groupCount: number;
  readonly feedCount: number;
  readonly friendCount: number;
  readonly email: string;
  readonly provider: Provider;
}

export interface Profile {
  readonly id: string;
  readonly accountId: string;
  readonly email: string;
  readonly provider: Provider;
  readonly name: string;
  readonly profileImageUrl: string | null;
  readonly newNotificationCount: number;
  readonly newInvitationCount: number;
  readonly hasFeed: boolean;
}

export interface SearchInput {
  readonly paginationInput: UserPaginationInput;
  readonly search: string;
}
