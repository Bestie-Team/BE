export type Provider = 'GOOGLE' | 'KAKAO' | 'APPLE';

export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REPORTED';

export interface PaginationInput {
  cursor: string;
  limit: number;
}
