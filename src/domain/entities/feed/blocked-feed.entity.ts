export class BlockedFeedEntity {
  constructor(
    readonly userId: string,
    readonly feedId: string,
    readonly createdAt: Date,
  ) {}

  static create(
    proto: { userId: string; feedId: string },
    stdDate: Date,
  ): BlockedFeedEntity {
    return new BlockedFeedEntity(proto.userId, proto.feedId, stdDate);
  }
}
