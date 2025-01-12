export type Provider = 'GOOGLE' | 'KAKAO' | 'APPLE';

export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REPORTED';

export type GatheringType = 'GROUP' | 'FRIEND';

export type GatheringParticipationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface UserPaginationInput {
  readonly cursor: {
    readonly name: string;
    readonly accountId: string;
  };
  readonly limit: number;
}

export interface PaginationInput {
  readonly cursor: string;
  readonly limit: number;
}

export interface PaginatedDateRangeInput extends PaginationInput {
  minDate: string;
  maxDate: string;
}
