export class FriendFeedVisibilityEntity {
  constructor(
    readonly feedId: string,
    readonly userId: string,
    readonly createdAt: Date,
  ) {}

  static create(
    proto: { feedId: string; userId: string },
    stdDate: Date,
  ): FriendFeedVisibilityEntity {
    return new FriendFeedVisibilityEntity(proto.feedId, proto.userId, stdDate);
  }
}
