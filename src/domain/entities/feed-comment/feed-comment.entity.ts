import { FeedCommentPrototype } from 'src/domain/types/feed-comment.types';

export class FeedCommentEntity {
  constructor(
    readonly id: string,
    readonly writerId: string,
    readonly feedId: string,
    readonly content: string,
    readonly createdAt: Date,
  ) {}

  static create(
    proto: FeedCommentPrototype,
    idGen: () => string,
    stdDate: Date,
  ): FeedCommentEntity {
    return {
      ...proto,
      id: idGen(),
      createdAt: stdDate,
    };
  }
}
