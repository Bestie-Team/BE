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

  static createBulk(feedId: string, friendIds: string[], stdDate: Date) {
    return friendIds.map((userId) => this.create({ feedId, userId }, stdDate));
  }
}
