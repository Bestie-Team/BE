export class FeedImageEntity {
  readonly id: string;
  readonly url: string;
  readonly createdAt: Date;

  static create(
    url: string,
    idGen: () => string,
    stdDate: Date,
  ): FeedImageEntity {
    return {
      id: idGen(),
      url,
      createdAt: stdDate,
    };
  }
}
