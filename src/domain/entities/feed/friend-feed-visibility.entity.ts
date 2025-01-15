export class FriendFeedVisibilityEntity {
  readonly feedId: string;
  readonly userId: string;
  readonly createdAt: Date;

  static create(
    prototype: { feedId: string; userId: string },
    stdDate: Date,
  ): FriendFeedVisibilityEntity {
    return {
      ...prototype,
      createdAt: stdDate,
    };
  }
}
