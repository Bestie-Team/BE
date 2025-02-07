export type Provider = 'GOOGLE' | 'KAKAO' | 'APPLE';
export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'REPORTED';
export type GatheringType = 'GROUP' | 'FRIEND';
export type GatheringParticipationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type GroupParticipationStatus = 'ACCEPTED' | 'REPORTED';
export type Order = 'DESC' | 'ASC';
export type ReportTypes = 'FRIEND' | 'FEED' | 'GROUP';
export type FriendRequestStatus = 'SENT' | 'RECEIVED' | 'NONE';

export interface UserPaginationInput {
  readonly cursor: {
    readonly name: string;
    readonly accountId: string;
  };
  readonly limit: number;
}

// TODO 나중에 제거하고 아래의 타입으로 모두 변경
export interface PaginationInput {
  readonly cursor: string;
  readonly limit: number;
}

export interface DateIdCursor {
  readonly createdAt: string;
  readonly id: string;
}

export interface DateIdPaginationInput {
  readonly cursor: DateIdCursor;
  readonly limit: number;
}

export interface PaginatedDateRangeInput extends DateIdPaginationInput {
  minDate: string;
  maxDate: string;
}
