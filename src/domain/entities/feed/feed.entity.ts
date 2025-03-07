import { FeedPrototype } from 'src/domain/types/feed.types';

export class FeedEntity {
  constructor(
    readonly id: string,
    readonly writerId: string,
    readonly gatheringId: string | null,
    readonly content: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(
    proto: FeedPrototype,
    idGen: () => string,
    stdDate: Date,
  ): FeedEntity {
    return new FeedEntity(
      idGen(),
      proto.writerId,
      proto.gatheringId,
      proto.content,
      stdDate,
      stdDate,
    );
  }
}
