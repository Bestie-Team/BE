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
    return {
      ...proto,
      createdAt: stdDate,
    };
  }
}
