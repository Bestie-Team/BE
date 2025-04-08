import { User } from 'src/domain/types/user.types';
import { Order } from 'src/shared/types';

export interface FeedPrototype {
  readonly writerId: string;
  readonly gatheringId: string | null;
  readonly content: string;
}

export interface CreateGatheringFeedInput {
  readonly writerId: string;
  readonly content: string;
  readonly gatheringId: string;
}

export interface FeedDetail {
  readonly id: string;
  readonly content: string;
  readonly writer: User;
  readonly gatheringId: string | null;
  readonly createdAt: Date;
  readonly images: string[];

  readonly gathering: {
    readonly id: string;
    readonly name: string;
    readonly gatheringDate: Date;
    readonly description: string;
    readonly invitationImageUrl: string;
  } | null;
  readonly commentCount: number;
}

export interface Feed {
  readonly id: string;
  readonly content: string;
  readonly images: string[];
  readonly writer: User;
  readonly createdAt: Date;
  commentCount: number;
  gathering: {
    readonly id: string;
    readonly name: string;
    readonly gatheringDate: Date;
  } | null;
  readonly withMembers: User[];
}

export interface FeedPaginationInput {
  readonly order: Order;
  readonly minDate: string;
  readonly maxDate: string;
  readonly cursor: {
    createdAt: string;
    id: string;
  };
  readonly limit: number;
}
