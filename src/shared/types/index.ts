export type Provider = 'GOOGLE' | 'KAKAO' | 'APPLE';

export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REPORTED';

export interface UserPaginationInput {
  readonly cursor: {
    readonly name: string;
    readonly accountId: string;
  };
  readonly limit: number;
}
