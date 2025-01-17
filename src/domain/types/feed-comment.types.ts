import { User } from 'src/domain/types/user.types';

export interface FeedCommentPrototype {
  readonly writerId: string;
  readonly feedId: string;
  readonly content: string;
}

export interface FeedComment {
  readonly id: string;
  readonly writer: User;
  readonly content: string;
  readonly createdAt: Date;
}
