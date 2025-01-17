export class FeedImageEntity {
  readonly id: string;
  readonly url: string;
  readonly index: number;
  readonly createdAt: Date;

  static create(
    prototype: { url: string; index: number },
    idGen: () => string,
    stdDate: Date,
  ): FeedImageEntity {
    return {
      id: idGen(),
      ...prototype,
      createdAt: stdDate,
    };
  }
}
