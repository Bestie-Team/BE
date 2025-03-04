export class FeedImageEntity {
  constructor(
    readonly id: string,
    readonly url: string,
    readonly index: number,
    readonly createdAt: Date,
  ) {}

  static create(
    proto: { url: string; index: number },
    idGen: () => string,
    stdDate: Date,
  ): FeedImageEntity {
    return new FeedImageEntity(idGen(), proto.url, proto.index, stdDate);
  }
}
