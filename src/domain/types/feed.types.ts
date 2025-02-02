import { User } from 'src/domain/types/user.types';
import { Order } from 'src/shared/types';

export interface FeedPrototype {
  readonly writerId: string;
  readonly gatheringId: string | null;
  readonly content: string;
}

export interface CreateGatheringFeedInput
  extends Pick<FeedPrototype, 'writerId' | 'content'> {
  readonly gatheringId: string;
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
    readonly members: User[];
  } | null;
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
