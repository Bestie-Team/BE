export class FeedImageEntity {
  readonly id: string;
  readonly feedId: string;
  readonly url: string;
  readonly createdAt: Date;

  static create(
    prototype: { url: string; feedId: string },
    idGen: () => string,
    stdDate: Date,
  ): FeedImageEntity {
    return {
      ...prototype,
      id: idGen(),
      createdAt: stdDate,
    };
  }
}
